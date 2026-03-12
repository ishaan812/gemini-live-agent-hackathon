import { useState, useEffect, useRef, useCallback } from 'react'
import {
  useAudioRecorder,
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  IOSOutputFormat,
  AudioQuality,
  AudioPlayer,
} from 'expo-audio'
import { aiAlpha, LIVE_MODEL, LIVE_CONFIG, getLiveSystemPrompt } from '../services/geminiService'
import { Stop } from '../types/stop'
import { writePcmToTempWav } from '../utils/audio'

interface Transcript {
  role: 'user' | 'assistant'
  content: string
}

export type LiveStatus = 'idle' | 'connecting' | 'connected' | 'listening' | 'speaking' | 'thinking'

interface LiveState {
  status: LiveStatus
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

// How often to flush accumulated audio chunks for playback (ms)
const AUDIO_FLUSH_INTERVAL = 300

export function useGeminiLive(stopContext: Stop | null) {
  const [state, setState] = useState<LiveState>({
    status: 'idle',
    transcripts: [],
    error: null,
  })

  const sessionRef = useRef<any>(null)
  const audioChunksRef = useRef<string[]>([])
  const isMountedRef = useRef(true)
  const playerRef = useRef<AudioPlayer | null>(null)
  const audioQueueRef = useRef<string[]>([]) // queue of WAV file URIs
  const isPlayingRef = useRef(false)
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const recorder = useAudioRecorder(PCM_RECORDING_OPTIONS)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      disconnect()
    }
  }, [])

  // Play next item in the audio queue
  async function playNextInQueue() {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false
      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          status: prev.status === 'speaking' ? 'connected' : prev.status,
        }))
      }
      return
    }

    isPlayingRef.current = true
    const fileUri = audioQueueRef.current.shift()!

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      })

      // Clean up previous player
      try { playerRef.current?.pause() } catch {}

      const newPlayer = createAudioPlayer({ uri: fileUri })
      newPlayer.addListener('playbackStatusUpdate', (status) => {
        if (status.playing === false && isMountedRef.current) {
          // Play next chunk when current one finishes
          playNextInQueue()
        }
      })
      playerRef.current = newPlayer
      newPlayer.play()
    } catch (error) {
      console.error('Audio playback error:', error)
      // Try next in queue
      playNextInQueue()
    }
  }

  // Flush accumulated audio chunks to a WAV file and queue for playback
  function flushAudioChunks() {
    if (audioChunksRef.current.length === 0) return

    const combined = audioChunksRef.current.join('')
    audioChunksRef.current = []

    try {
      const fileUri = writePcmToTempWav(combined, 24000)
      audioQueueRef.current.push(fileUri)

      // Start playback if not already playing
      if (!isPlayingRef.current) {
        playNextInQueue()
      }
    } catch (error) {
      console.error('Audio flush error:', error)
    }
  }

  // Schedule a flush of audio chunks
  function scheduleFlush() {
    if (flushTimerRef.current) return // already scheduled
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null
      flushAudioChunks()
    }, AUDIO_FLUSH_INTERVAL)
  }

  const connect = useCallback(async () => {
    if (!stopContext || sessionRef.current) return

    setState((prev) => ({ ...prev, status: 'connecting', error: null }))

    try {
      const session = await aiAlpha.live.connect({
        model: LIVE_MODEL,
        config: {
          ...LIVE_CONFIG,
          systemInstruction: {
            parts: [{ text: getLiveSystemPrompt(stopContext) }],
          },
        },
        callbacks: {
          onopen: () => {
            if (!isMountedRef.current) return
            setState((prev) => ({
              ...prev,
              status: 'connected',
            }))
          },
          onmessage: (message: any) => {
            if (!isMountedRef.current) return

            const content = message.serverContent
            if (!content) return

            // Collect audio chunks and schedule flush for streaming playback
            if (content.modelTurn?.parts) {
              for (const part of content.modelTurn.parts) {
                if (part.inlineData?.data) {
                  audioChunksRef.current.push(part.inlineData.data)
                  setState((prev) => ({ ...prev, status: 'speaking' }))
                  scheduleFlush()
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

            // Turn complete — flush any remaining audio
            if (content.turnComplete) {
              if (flushTimerRef.current) {
                clearTimeout(flushTimerRef.current)
                flushTimerRef.current = null
              }
              flushAudioChunks()
            }
          },
          onerror: (e: any) => {
            if (!isMountedRef.current) return
            console.error('Live session error:', e)
            setState((prev) => ({
              ...prev,
              error: e.message || 'Connection error',
              status: 'idle',
            }))
          },
          onclose: () => {
            if (!isMountedRef.current) return
            sessionRef.current = null
            setState((prev) => ({
              ...prev,
              status: 'idle',
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
        status: 'idle',
        error: error.message || 'Failed to connect',
      }))
    }
  }, [stopContext])

  const disconnect = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current)
      flushTimerRef.current = null
    }
    if (recorder.isRecording) {
      recorder.stop().catch(() => {})
    }
    try { playerRef.current?.pause() } catch {}
    audioQueueRef.current = []
    isPlayingRef.current = false
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
        status: 'idle',
      }))
    }
  }, [recorder])

  const sendText = useCallback((text: string) => {
    if (!sessionRef.current || !text.trim()) return

    sessionRef.current.sendClientContent({
      turns: [{ role: 'user', parts: [{ text: text.trim() }] }],
    })
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
        setState((prev) => ({ ...prev, status: 'listening' }))
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
        setState((prev) => ({ ...prev, status: 'thinking' }))
      }

      if (uri) {
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
        setState((prev) => ({ ...prev, status: 'connected' }))
      }
    }
  }, [recorder])

  return {
    ...state,
    connected: state.status !== 'idle' && state.status !== 'connecting',
    connecting: state.status === 'connecting',
    speaking: state.status === 'speaking',
    recording: state.status === 'listening',
    connect,
    disconnect,
    sendText,
    startRecording,
    stopRecording,
  }
}
