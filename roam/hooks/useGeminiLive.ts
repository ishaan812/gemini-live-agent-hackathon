import { useState, useEffect, useRef, useCallback } from 'react'
import {
  useAudioRecorder,
  useAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  IOSOutputFormat,
  AudioQuality,
} from 'expo-audio'
import { Modality } from '@google/genai'
import { ai, LIVE_MODEL, getLiveSystemPrompt } from '../services/geminiService'
import { Stop } from '../types/stop'

interface Transcript {
  role: 'user' | 'assistant'
  content: string
}

interface LiveState {
  connected: boolean
  connecting: boolean
  speaking: boolean
  recording: boolean
  transcripts: Transcript[]
  error: string | null
}

const PCM_RECORDING_OPTIONS = {
  extension: '.wav',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 256000,
  android: {
    outputFormat: 'default' as const,
    audioEncoder: 'default' as const,
  },
  ios: {
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.HIGH,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm' as const,
    bitsPerSecond: 128000,
  },
}

export function useGeminiLive(stopContext: Stop | null) {
  const [state, setState] = useState<LiveState>({
    connected: false,
    connecting: false,
    speaking: false,
    recording: false,
    transcripts: [],
    error: null,
  })

  const sessionRef = useRef<any>(null)
  const audioChunksRef = useRef<string[]>([])
  const isMountedRef = useRef(true)

  const recorder = useAudioRecorder(PCM_RECORDING_OPTIONS)
  const player = useAudioPlayer(null)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      disconnect()
    }
  }, [])

  // Listen for playback completion
  useEffect(() => {
    const listener = player.addListener('playbackStatusUpdate', (status) => {
      if (status.playing === false && isMountedRef.current) {
        setState((prev) => ({ ...prev, speaking: false }))
      }
    })
    return () => listener.remove()
  }, [player])

  const connect = useCallback(async () => {
    if (!stopContext || sessionRef.current) return

    setState((prev) => ({ ...prev, connecting: true, error: null }))

    try {
      const session = await ai.live.connect({
        model: LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: {
            parts: [
              {
                text: getLiveSystemPrompt(stopContext),
              },
            ],
          },
        },
        callbacks: {
          onopen: () => {
            if (!isMountedRef.current) return
            setState((prev) => ({
              ...prev,
              connected: true,
              connecting: false,
            }))
          },
          onmessage: (message: any) => {
            if (!isMountedRef.current) return

            const content = message.serverContent
            if (!content) return

            // Collect audio chunks for playback
            if (content.modelTurn?.parts) {
              for (const part of content.modelTurn.parts) {
                if (part.inlineData?.data) {
                  audioChunksRef.current.push(part.inlineData.data)
                  setState((prev) => ({ ...prev, speaking: true }))
                }
              }
            }

            // Handle transcriptions
            if (content.inputTranscription?.text) {
              const text = content.inputTranscription.text
              setState((prev) => {
                const transcripts = [...prev.transcripts]
                const last = transcripts[transcripts.length - 1]
                if (last?.role === 'user') {
                  transcripts[transcripts.length - 1] = {
                    ...last,
                    content: last.content + text,
                  }
                } else {
                  transcripts.push({ role: 'user', content: text })
                }
                return { ...prev, transcripts }
              })
            }

            if (content.outputTranscription?.text) {
              const text = content.outputTranscription.text
              setState((prev) => {
                const transcripts = [...prev.transcripts]
                const last = transcripts[transcripts.length - 1]
                if (last?.role === 'assistant') {
                  transcripts[transcripts.length - 1] = {
                    ...last,
                    content: last.content + text,
                  }
                } else {
                  transcripts.push({ role: 'assistant', content: text })
                }
                return { ...prev, transcripts }
              })
            }

            // Turn complete — audio finished
            if (content.turnComplete) {
              setState((prev) => ({ ...prev, speaking: false }))
              playCollectedAudio()
            }
          },
          onerror: (e: any) => {
            if (!isMountedRef.current) return
            console.error('Live session error:', e)
            setState((prev) => ({
              ...prev,
              error: e.message || 'Connection error',
              connected: false,
              connecting: false,
            }))
          },
          onclose: () => {
            if (!isMountedRef.current) return
            sessionRef.current = null
            setState((prev) => ({
              ...prev,
              connected: false,
              connecting: false,
            }))
          },
        },
      })

      sessionRef.current = session
    } catch (error: any) {
      if (!isMountedRef.current) return
      console.error('Failed to connect:', error)
      setState((prev) => ({
        ...prev,
        connecting: false,
        error: error.message || 'Failed to connect',
      }))
    }
  }, [stopContext])

  const disconnect = useCallback(() => {
    if (recorder.isRecording) {
      recorder.stop().catch(() => {})
    }
    player.pause()
    if (sessionRef.current) {
      try {
        sessionRef.current.close()
      } catch {}
      sessionRef.current = null
    }
    audioChunksRef.current = []
    if (isMountedRef.current) {
      setState((prev) => ({
        ...prev,
        connected: false,
        recording: false,
        speaking: false,
      }))
    }
  }, [recorder, player])

  const sendText = useCallback((text: string) => {
    if (!sessionRef.current || !text.trim()) return

    sessionRef.current.sendRealtimeInput({ text: text.trim() })
    setState((prev) => ({
      ...prev,
      transcripts: [
        ...prev.transcripts,
        { role: 'user', content: text.trim() },
      ],
    }))
  }, [])

  const startRecording = useCallback(async () => {
    if (!sessionRef.current) return

    try {
      const permission = await requestRecordingPermissionsAsync()
      if (!permission.granted) {
        setState((prev) => ({
          ...prev,
          error: 'Microphone permission denied',
        }))
        return
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      })

      await recorder.prepareToRecordAsync()
      recorder.record()

      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, recording: true }))
      }
    } catch (error: any) {
      console.error('Failed to start recording:', error)
      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          error: 'Failed to start recording',
        }))
      }
    }
  }, [recorder])

  const stopRecording = useCallback(async () => {
    if (!recorder.isRecording || !sessionRef.current) return

    try {
      await recorder.stop()
      const uri = recorder.uri

      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, recording: false }))
      }

      if (uri) {
        // Read the recorded file and send as base64 PCM
        const response = await fetch(uri)
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1]
          if (base64 && sessionRef.current) {
            sessionRef.current.sendRealtimeInput({
              audio: {
                data: base64,
                mimeType: 'audio/pcm;rate=16000',
              },
            })
          }
        }
        reader.readAsDataURL(blob)
      }

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      })
    } catch (error: any) {
      console.error('Failed to stop recording:', error)
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, recording: false }))
      }
    }
  }, [recorder])

  async function playCollectedAudio() {
    if (audioChunksRef.current.length === 0) return

    try {
      // Combine all audio chunks into one base64 string
      const combined = audioChunksRef.current.join('')
      audioChunksRef.current = []

      // Create a data URI for PCM audio
      const dataUri = `data:audio/pcm;rate=24000;base64,${combined}`

      player.replace({ uri: dataUri })
      player.play()
    } catch (error) {
      console.error('Audio playback error:', error)
      audioChunksRef.current = []
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, speaking: false }))
      }
    }
  }

  return {
    ...state,
    connect,
    disconnect,
    sendText,
    startRecording,
    stopRecording,
  }
}
