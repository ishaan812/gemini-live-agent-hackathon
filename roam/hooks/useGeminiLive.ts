import { useState, useEffect, useRef, useCallback } from 'react'
import { Room, RoomEvent, RemoteTrack, RemoteTrackPublication, RemoteParticipant } from 'livekit-client'
import { AudioSession } from '@livekit/react-native'
import { Stop } from '../types/stop'
import { Config } from '../constants/config'
import { useUserStore } from '../store/userStore'

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

export function useGeminiLive(stopContext: Stop | null) {
  const [state, setState] = useState<LiveState>({
    status: 'idle',
    transcripts: [],
    error: null,
  })

  const roomRef = useRef<Room | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      disconnect()
    }
  }, [])

  const connect = useCallback(async () => {
    if (!stopContext || roomRef.current) return

    setState((prev) => ({ ...prev, status: 'connecting', error: null }))

    try {
      // Configure audio for bidirectional WebRTC (record + playback)
      await AudioSession.configureAudio({
        ios: { defaultOutput: 'speaker' },
      })
      await AudioSession.setAppleAudioConfiguration({
        audioCategory: 'playAndRecord',
        audioCategoryOptions: ['defaultToSpeaker', 'allowBluetooth'],
        audioMode: 'voiceChat',
      })
      await AudioSession.startAudioSession()

      // Get token from server
      const { name, narrationStyle, language } = useUserStore.getState()
      const resp = await fetch(`${Config.SERVER_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: name || 'explorer',
          stopContext: {
            name: stopContext.name,
            description: stopContext.description,
          },
          userPrefs: { name, narrationStyle, language },
        }),
      })

      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`)
      }

      const { token, wsUrl } = await resp.json()

      // Create and configure LiveKit room with proper options
      const room = new Room({
        adaptiveStream: true,
        dynacast: false,
        disconnectOnPageLeave: false,
      })

      // Handle data messages from agent (transcripts, status)
      room.on(RoomEvent.DataReceived, (data: Uint8Array) => {
        if (!isMountedRef.current) return
        try {
          const msg = JSON.parse(new TextDecoder().decode(data))

          if (msg.type === 'status') {
            setState((prev) => ({ ...prev, status: msg.value as LiveStatus }))
          }

          if (msg.type === 'inputTranscription') {
            setState((prev) => {
              const transcripts = [...prev.transcripts]
              const last = transcripts[transcripts.length - 1]
              if (last?.role === 'user') {
                transcripts[transcripts.length - 1] = {
                  ...last,
                  content: last.content + msg.text,
                }
              } else {
                transcripts.push({ role: 'user', content: msg.text })
              }
              return { ...prev, transcripts }
            })
          }

          if (msg.type === 'outputTranscription') {
            setState((prev) => {
              const transcripts = [...prev.transcripts]
              const last = transcripts[transcripts.length - 1]
              if (last?.role === 'assistant') {
                transcripts[transcripts.length - 1] = {
                  ...last,
                  content: last.content + msg.text,
                }
              } else {
                transcripts.push({ role: 'assistant', content: msg.text })
              }
              return { ...prev, transcripts }
            })
          }

          if (msg.type === 'turnComplete') {
            setState((prev) => ({
              ...prev,
              status: 'connected',
            }))
          }

          if (msg.type === 'error') {
            setState((prev) => ({
              ...prev,
              error: msg.message || 'Agent error',
            }))
          }
        } catch {}
      })

      room.on(RoomEvent.Disconnected, () => {
        console.log('[LiveKit] Disconnected from room')
        if (!isMountedRef.current) return
        roomRef.current = null
        setState((prev) => ({ ...prev, status: 'idle' }))
      })

      room.on(RoomEvent.Reconnecting, () => {
        console.log('[LiveKit] Reconnecting...')
      })

      room.on(RoomEvent.Reconnected, () => {
        console.log('[LiveKit] Reconnected')
        if (isMountedRef.current) {
          setState((prev) => ({ ...prev, status: 'connected' }))
        }
      })

      // Log when agent audio track is subscribed (confirms audio path works)
      room.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, pub: RemoteTrackPublication, participant: RemoteParticipant) => {
          console.log(`[LiveKit] Track subscribed: ${participant.identity} kind=${track.kind} source=${pub.source}`)
        },
      )

      // Connect to LiveKit room
      await room.connect(wsUrl, token)
      roomRef.current = room
      console.log('[LiveKit] Connected to room:', room.name)

      // Enable microphone — audio streams continuously to agent via WebRTC
      // Gemini's native VAD handles turn detection automatically
      await room.localParticipant.setMicrophoneEnabled(true)
      console.log('[LiveKit] Microphone enabled')

      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, status: 'connected' }))
      }
    } catch (error: any) {
      console.error('LiveKit connect error:', error)
      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          status: 'idle',
          error: error.message || 'Failed to connect',
        }))
      }
    }
  }, [stopContext])

  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect()
      roomRef.current = null
    }
    AudioSession.stopAudioSession()
    if (isMountedRef.current) {
      setState((prev) => ({ ...prev, status: 'idle' }))
    }
  }, [])

  const sendText = useCallback((text: string) => {
    if (!roomRef.current || !text.trim()) return

    const data = new TextEncoder().encode(
      JSON.stringify({ type: 'text', text: text.trim() }),
    )
    roomRef.current.localParticipant.publishData(data, { reliable: true })

    setState((prev) => ({
      ...prev,
      transcripts: [
        ...prev.transcripts,
        { role: 'user', content: text.trim() },
      ],
    }))
  }, [])

  // startRecording = unmute mic (for UI compatibility)
  const startRecording = useCallback(async () => {
    if (!roomRef.current) return
    await roomRef.current.localParticipant.setMicrophoneEnabled(true)
    if (isMountedRef.current) {
      setState((prev) => ({ ...prev, status: 'listening' }))
    }
  }, [])

  // stopRecording = mute mic (for UI compatibility)
  const stopRecording = useCallback(async () => {
    if (!roomRef.current) return
    await roomRef.current.localParticipant.setMicrophoneEnabled(false)
    if (isMountedRef.current) {
      setState((prev) => ({ ...prev, status: 'connected' }))
    }
  }, [])

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
