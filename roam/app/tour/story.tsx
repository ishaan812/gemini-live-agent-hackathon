import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useTour } from '../../hooks/useTour'
import { generateNarration } from '../../services/geminiService'
import { useNarrationPlayback } from '../../hooks/useNarrationPlayback'
import { useGeminiLive } from '../../hooks/useGeminiLive'
import { HighlightedNarration } from '../../components/HighlightedNarration'
import { FloatingOrb, OrbMode } from '../../components/FloatingOrb'
import { Colors, Fonts } from '../../constants/colors'

type ScreenMode = 'loading' | 'narrating' | 'paused' | 'conversing'

export default function StoryScreen() {
  const router = useRouter()
  const { stops, currentStop, currentStopIndex, nextStop, isComplete } = useTour()
  const [narration, setNarration] = useState<string>('')
  const [mode, setMode] = useState<ScreenMode>('loading')

  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const nextStopData = currentStopIndex < stops.length - 1 ? stops[currentStopIndex + 1] : null

  const {
    status: narrationStatus,
    currentWordIndex,
    words,
    start: startNarration,
    pause: pauseNarration,
    resume: resumeNarration,
    stop: stopNarration,
  } = useNarrationPlayback()

  const {
    status: liveStatus,
    connected: qaConnected,
    speaking: qaSpeaking,
    recording: qaRecording,
    connect: qaConnect,
    disconnect: qaDisconnect,
    startRecording: qaStartRecording,
    stopRecording: qaStopRecording,
  } = useGeminiLive(currentStop)

  // Generate narration text on mount
  useEffect(() => {
    let cancelled = false
    async function loadNarration() {
      if (!currentStop) return
      setMode('loading')
      const text = await generateNarration(currentStop, nextStopData)
      if (cancelled) return
      setNarration(text)
      startNarration(text)
      setMode('narrating')
    }
    loadNarration()

    return () => {
      cancelled = true
      stopNarration()
      qaDisconnect()
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [currentStop?.id])

  // Watch for Q&A answer to finish → auto-resume narration
  useEffect(() => {
    if (mode === 'conversing' && !qaSpeaking && !qaRecording && liveStatus === 'connected') {
      resumeTimerRef.current = setTimeout(() => {
        qaDisconnect()
        resumeNarration()
        setMode('narrating')
      }, 1500)
    }

    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current)
        resumeTimerRef.current = null
      }
    }
  }, [mode, qaSpeaking, qaRecording, liveStatus])

  const handleOrbPress = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = null
    }

    if (mode === 'narrating') {
      pauseNarration()
      setMode('paused')
      qaConnect()
    } else if (mode === 'paused') {
      if (qaConnected) {
        qaStartRecording()
        setMode('conversing')
      }
    } else if (mode === 'conversing') {
      if (qaRecording) {
        qaStopRecording()
      } else if (qaSpeaking) {
        qaDisconnect()
        resumeNarration()
        setMode('narrating')
      }
    }
  }, [
    mode, qaConnected, qaRecording, qaSpeaking,
    pauseNarration, resumeNarration,
    qaConnect, qaDisconnect, qaStartRecording, qaStopRecording,
  ])

  const handleNextStop = useCallback(() => {
    stopNarration()
    qaDisconnect()
    if (isComplete) {
      router.push('/tour/completion')
    } else {
      nextStop()
      router.push('/tour/map')
    }
  }, [isComplete, nextStop, router, stopNarration, qaDisconnect])

  const orbMode: OrbMode =
    mode === 'narrating' ? 'narrating'
      : mode === 'paused' ? 'paused'
        : mode === 'conversing' ? 'conversing'
          : 'idle'

  if (mode === 'loading' && !narration) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Preparing your story...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* TOP: Orb section */}
      <View style={styles.orbSection}>
        <Text style={styles.stopName}>{currentStop?.name}</Text>
        <FloatingOrb mode={orbMode} onPress={handleOrbPress} />
      </View>

      {/* BOTTOM: Text card */}
      <View style={styles.textCard}>
        {words.length > 0 ? (
          <HighlightedNarration
            words={words}
            currentWordIndex={currentWordIndex}
          />
        ) : (
          <Text style={styles.fallbackText}>{narration}</Text>
        )}
      </View>

      {/* BUTTONS */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/tour/history')}
        >
          <Text style={styles.secondaryButtonText}>{'\u{1F3DB}'} See Past</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNextStop}>
          <Text style={styles.nextButtonText}>
            {isComplete ? 'Finish Tour' : `Next: ${nextStopData?.name ?? 'Stop'}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 16,
  },

  // Top section — orb
  orbSection: {
    flex: 0.38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  stopName: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },

  // Bottom section — text card
  textCard: {
    flex: 0.52,
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  fallbackText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 28,
    color: Colors.textSecondary,
    padding: 20,
  },

  // Buttons
  buttonContainer: {
    flex: 0.1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  secondaryButton: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  nextButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
})
