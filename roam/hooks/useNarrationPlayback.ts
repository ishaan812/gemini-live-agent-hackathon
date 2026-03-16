import { useState, useRef, useCallback, useEffect } from 'react'
import {
  createAudioPlayer,
  setAudioModeAsync,
  AudioPlayer,
} from 'expo-audio'
import { generateNarrationTTS } from '../services/geminiService'
import { writePcmToTempWav } from '../utils/audio'
import { splitWords, estimateWordTimestamps, findWordIndexAtTime, WordTimestamp } from '../utils/wordSync'

export type NarrationStatus = 'idle' | 'loading' | 'playing' | 'paused'

const PROGRESS_POLL_INTERVAL = 100

export function useNarrationPlayback() {
  const [status, setStatus] = useState<NarrationStatus>('idle')
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [words, setWords] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const playerRef = useRef<AudioPlayer | null>(null)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wordTimestampsRef = useRef<WordTimestamp[]>([])
  const wordsRef = useRef<string[]>([])
  const isMountedRef = useRef(true)
  const statusRef = useRef<NarrationStatus>('idle')
  const startIdRef = useRef(0)
  const durationKnownRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      cleanup()
    }
  }, [])

  function setStatusBoth(s: NarrationStatus) {
    statusRef.current = s
    if (isMountedRef.current) setStatus(s)
  }

  function cleanup() {
    stopProgressTimer()
    try { playerRef.current?.pause() } catch {}
    playerRef.current = null
    durationKnownRef.current = false
  }

  function stopProgressTimer() {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }

  function startProgressTimer() {
    stopProgressTimer()
    progressTimerRef.current = setInterval(() => {
      const player = playerRef.current
      if (!player || !isMountedRef.current) return

      const currentTime = player.currentTime ?? 0
      const totalDuration = player.duration ?? 0

      if (totalDuration > 0) {
        setProgress(currentTime / totalDuration)
      }

      const timestamps = wordTimestampsRef.current
      if (timestamps.length > 0) {
        const idx = findWordIndexAtTime(timestamps, currentTime)
        setCurrentWordIndex(idx)
      }
    }, PROGRESS_POLL_INTERVAL)
  }

  const start = useCallback(async (text: string, stopId?: string) => {
    cleanup()

    // Increment start ID to detect stale calls
    const myStartId = ++startIdRef.current

    const w = splitWords(text)
    wordsRef.current = w
    setWords(w)
    setCurrentWordIndex(0)
    setProgress(0)
    setStatusBoth('loading')

    console.log('[Narration] Generating TTS audio...')
    const result = await generateNarrationTTS(text, stopId)

    // Bail if this start call was superseded
    if (startIdRef.current !== myStartId) return
    if (!isMountedRef.current) return

    if (!result) {
      console.error('[Narration] TTS generation returned null')
      setStatusBoth('idle')
      return
    }

    console.log('[Narration] TTS audio received, base64 length:', result.audioBase64.length)

    try {
      const fileUri = writePcmToTempWav(result.audioBase64, 24000)

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      })

      // Bail again after async
      if (startIdRef.current !== myStartId || !isMountedRef.current) return

      const player = createAudioPlayer({ uri: fileUri })
      playerRef.current = player
      durationKnownRef.current = false

      player.addListener('playbackStatusUpdate', (s) => {
        if (!isMountedRef.current) return
        // Stale player check
        if (playerRef.current !== player) return

        // Capture duration once on first play
        if (s.playing === true && !durationKnownRef.current) {
          durationKnownRef.current = true
          const dur = player.duration ?? 0
          console.log('[Narration] Playback started, duration:', dur)
          setDuration(dur)
          wordTimestampsRef.current = estimateWordTimestamps(wordsRef.current, dur)
          startProgressTimer()
        }

        // Detect playback end: must be playing status AND near end of audio
        if (s.playing === false && statusRef.current === 'playing' && durationKnownRef.current) {
          const cur = player.currentTime ?? 0
          const dur = player.duration ?? 0
          if (dur > 0 && cur >= dur - 0.15) {
            console.log('[Narration] Playback ended')
            stopProgressTimer()
            setCurrentWordIndex(wordsRef.current.length)
            setProgress(1)
            setStatusBoth('idle')
          }
        }
      })

      player.play()
      setStatusBoth('playing')
      console.log('[Narration] Playing!')
    } catch (error) {
      console.error('[Narration] Playback error:', error)
      if (startIdRef.current === myStartId) {
        setStatusBoth('idle')
      }
    }
  }, [])

  const pause = useCallback(() => {
    console.log('[Narration] Pause')
    // Set status FIRST so listener doesn't think playback ended
    setStatusBoth('paused')
    stopProgressTimer()
    try { playerRef.current?.pause() } catch {}
  }, [])

  const resume = useCallback(() => {
    console.log('[Narration] Resume')
    setStatusBoth('playing')
    startProgressTimer()
    try { playerRef.current?.play() } catch {}
  }, [])

  const stop = useCallback(() => {
    console.log('[Narration] Stop')
    startIdRef.current++ // Invalidate any in-progress start()
    cleanup()
    setStatusBoth('idle')
    setCurrentWordIndex(0)
    setProgress(0)
  }, [])

  return {
    status,
    currentWordIndex,
    words,
    progress,
    duration,
    start,
    pause,
    resume,
    stop,
  }
}
