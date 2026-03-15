import { useState, useRef, useCallback, useEffect } from 'react'
import {
  createAudioPlayer,
  setAudioModeAsync,
  AudioPlayer,
} from 'expo-audio'
import { aiAlpha, LIVE_MODEL, LIVE_SPEECH_CONFIG } from '../services/geminiService'
import { Modality } from '@google/genai'
import { writeChunksToTempWav } from '../utils/audio'
import { splitWords } from '../utils/wordSync'
import { useUserStore } from '../store/userStore'

export type NarrationStatus = 'idle' | 'loading' | 'playing' | 'paused'

// Larger buffers = fewer file transitions = smoother audio with less gapping
const AUDIO_FLUSH_INTERVAL = 500

const STYLE_MAP: Record<string, string> = {
  historical: 'scholarly and historically rich with dates and facts',
  funny: 'witty, sarcastic, and humorous — make the tourist laugh',
  poetic: 'lyrical and poetic with vivid imagery and metaphors',
  adventurous: 'dramatic and exciting like an adventure story',
}

const LANG_MAP: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  gu: 'Gujarati',
}

export function useNarrationPlayback() {
  const [status, setStatus] = useState<NarrationStatus>('idle')
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [words, setWords] = useState<string[]>([])

  const sessionRef = useRef<any>(null)
  const audioChunksRef = useRef<string[]>([])
  const audioQueueRef = useRef<string[]>([])
  const isPlayingRef = useRef(false)
  const playerRef = useRef<AudioPlayer | null>(null)
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(true)
  const wordIndexRef = useRef(0)
  const pausedAtWordIndexRef = useRef(0)
  const wordsRef = useRef<string[]>([])
  const turnCompleteRef = useRef(false)

  // Audio-chunk-based word estimation
  const totalAudioChunksReceivedRef = useRef(0)
  const totalAudioChunksAtTurnCompleteRef = useRef(0)
  const chunksPlayedRef = useRef(0)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      cleanupSession()
    }
  }, [])

  const updateWordIndex = useCallback((newIndex: number) => {
    const clamped = Math.min(newIndex, wordsRef.current.length)
    wordIndexRef.current = clamped
    if (isMountedRef.current) {
      setCurrentWordIndex(clamped)
    }
  }, [])

  // Estimate word position based on fraction of audio chunks played
  function estimateWordFromChunks() {
    const total = totalAudioChunksAtTurnCompleteRef.current || totalAudioChunksReceivedRef.current
    if (total === 0) return
    const fraction = chunksPlayedRef.current / total
    const estimatedWord = Math.floor(fraction * wordsRef.current.length)
    if (estimatedWord > wordIndexRef.current) {
      updateWordIndex(estimatedWord)
    }
  }

  // Matches the exact same pattern as useGeminiLive playNextInQueue
  async function playNextInQueue() {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false
      if (turnCompleteRef.current && isMountedRef.current) {
        turnCompleteRef.current = false
        updateWordIndex(wordsRef.current.length)
        setStatus('idle')
      }
      return
    }

    isPlayingRef.current = true
    const fileUri = audioQueueRef.current.shift()!
    chunksPlayedRef.current += 1
    estimateWordFromChunks()

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      })

      // Clean up previous player
      try { playerRef.current?.pause() } catch {}

      const newPlayer = createAudioPlayer(fileUri)
      let didStartPlaying = false
      newPlayer.addListener('playbackStatusUpdate', (s) => {
        if (s.playing === true) {
          didStartPlaying = true
        }
        if (didStartPlaying && s.playing === false && isMountedRef.current) {
          didStartPlaying = false
          playNextInQueue()
        }
      })
      playerRef.current = newPlayer
      newPlayer.play()
    } catch (error) {
      console.error('Narration playback error:', error)
      // Try next in queue
      playNextInQueue()
    }
  }

  function flushAudioChunks() {
    if (audioChunksRef.current.length === 0) return

    const chunks = [...audioChunksRef.current]
    audioChunksRef.current = []

    try {
      // Decode each base64 chunk individually to avoid padding corruption
      const fileUri = writeChunksToTempWav(chunks, 24000)
      if (!fileUri) return // Skip empty/too-small audio chunks
      audioQueueRef.current.push(fileUri)
      totalAudioChunksReceivedRef.current += 1

      if (!isPlayingRef.current) {
        playNextInQueue()
      }
    } catch (error) {
      console.error('Narration flush error:', error)
    }
  }

  function scheduleFlush() {
    if (flushTimerRef.current) return
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null
      flushAudioChunks()
    }, AUDIO_FLUSH_INTERVAL)
  }

  function cleanupSession() {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current)
      flushTimerRef.current = null
    }
    try { playerRef.current?.pause() } catch {}
    playerRef.current = null
    audioQueueRef.current = []
    audioChunksRef.current = []
    isPlayingRef.current = false
    turnCompleteRef.current = false
    if (sessionRef.current) {
      try { sessionRef.current.close() } catch {}
      sessionRef.current = null
    }
  }

  const openSession = useCallback(async (text: string) => {
    const { narrationStyle, language } = useUserStore.getState()
    const style = STYLE_MAP[narrationStyle] || STYLE_MAP.historical
    const lang = LANG_MAP[language] || 'English'

    turnCompleteRef.current = false
    totalAudioChunksReceivedRef.current = 0
    totalAudioChunksAtTurnCompleteRef.current = 0
    chunksPlayedRef.current = 0

    try {
      const session = await aiAlpha.live.connect({
        model: LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: LIVE_SPEECH_CONFIG,
          systemInstruction: {
            parts: [{
              text: `You are Roam, a warm expressive narrator. Read the following text aloud with emotion, dramatic flair, and natural pauses. Speak in ${lang}. Your style: ${style}. Do NOT add any extra commentary — just narrate the text beautifully.`,
            }],
          },
        },
        callbacks: {
          onopen: () => {},
          onmessage: (message: any) => {
            if (!isMountedRef.current) return

            const content = message.serverContent
            if (!content) return

            if (content.modelTurn?.parts) {
              for (const part of content.modelTurn.parts) {
                if (part.inlineData?.data) {
                  audioChunksRef.current.push(part.inlineData.data)
                  scheduleFlush()
                }
              }
            }

            if (content.turnComplete) {
              if (flushTimerRef.current) {
                clearTimeout(flushTimerRef.current)
                flushTimerRef.current = null
              }
              flushAudioChunks()
              totalAudioChunksAtTurnCompleteRef.current = totalAudioChunksReceivedRef.current
              turnCompleteRef.current = true

              if (!isPlayingRef.current && audioQueueRef.current.length === 0) {
                if (isMountedRef.current) {
                  turnCompleteRef.current = false
                  updateWordIndex(wordsRef.current.length)
                  setStatus('idle')
                }
              }

              try { sessionRef.current?.close() } catch {}
              sessionRef.current = null
            }
          },
          onerror: (e: any) => {
            console.error('Narration session error:', e)
            if (isMountedRef.current) {
              setStatus('idle')
            }
          },
          onclose: () => {
            sessionRef.current = null
          },
        },
      })

      sessionRef.current = session

      session.sendClientContent({
        turns: [{ role: 'user', parts: [{ text }] }],
      })
    } catch (error) {
      console.error('Failed to open narration session:', error)
      if (isMountedRef.current) {
        setStatus('idle')
      }
    }
  }, [])

  const start = useCallback(async (text: string) => {
    cleanupSession()
    const w = splitWords(text)
    wordsRef.current = w
    setWords(w)
    wordIndexRef.current = 0
    setCurrentWordIndex(0)
    pausedAtWordIndexRef.current = 0
    totalAudioChunksReceivedRef.current = 0
    totalAudioChunksAtTurnCompleteRef.current = 0
    chunksPlayedRef.current = 0
    setStatus('playing')
    await openSession(text)
  }, [openSession])

  const pause = useCallback(() => {
    pausedAtWordIndexRef.current = wordIndexRef.current
    cleanupSession()
    setStatus('paused')
  }, [])

  const resume = useCallback(async () => {
    const idx = pausedAtWordIndexRef.current
    const remainingWords = wordsRef.current.slice(idx)
    if (remainingWords.length === 0) {
      setStatus('idle')
      return
    }

    const remainingText = remainingWords.join(' ')
    setStatus('playing')
    await openSession(remainingText)
  }, [openSession])

  const stop = useCallback(() => {
    cleanupSession()
    setStatus('idle')
    setCurrentWordIndex(0)
    wordIndexRef.current = 0
  }, [])

  return {
    status,
    currentWordIndex,
    words,
    start,
    pause,
    resume,
    stop,
  }
}
