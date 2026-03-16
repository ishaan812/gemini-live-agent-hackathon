import React, { useCallback, useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useTour } from '../../hooks/useTour'
import { generateNarration } from '../../services/geminiService'
import { useNarrationPlayback } from '../../hooks/useNarrationPlayback'
import { HighlightedNarration } from '../../components/HighlightedNarration'
import { Colors, Fonts } from '../../constants/colors'
import { useConnection } from '../../hooks/useConnection'

type ScreenMode = 'loading' | 'narrating'

export default function StoryScreen() {
  const router = useRouter()
  const { stops, currentStop, currentStopIndex, nextStop, isComplete } = useTour()
  const [narration, setNarration] = useState<string>('')
  const [mode, setMode] = useState<ScreenMode>('loading')
  const connection = useConnection()

  const nextStopData = currentStopIndex < stops.length - 1 ? stops[currentStopIndex + 1] : null

  const {
    status: narrationStatus,
    currentWordIndex,
    words,
    progress,
    start: startNarration,
    pause: pauseNarration,
    resume: resumeNarration,
    stop: stopNarration,
  } = useNarrationPlayback()

  // Generate narration text + TTS audio, stay on loading screen until both are ready
  useEffect(() => {
    let cancelled = false
    async function loadNarration() {
      if (!currentStop) return
      setMode('loading')

      // Step 1: Generate narration text
      const text = await generateNarration(currentStop, nextStopData)
      if (cancelled) return
      setNarration(text)

      // Step 2: Generate TTS audio (blocks until audio is ready)
      await startNarration(text, currentStop.id)
      if (cancelled) return

      // Step 3: Only now show the narrating screen
      setMode('narrating')
    }
    loadNarration()

    return () => {
      cancelled = true
      stopNarration()
    }
  }, [currentStop?.id])

  const handleLiveGuide = useCallback(() => {
    stopNarration()
    connection.connect()
    router.push('/tour/assistant')
  }, [stopNarration, connection, router])

  const handleNextStop = useCallback(() => {
    stopNarration()
    if (isComplete) {
      router.push('/tour/completion')
    } else {
      nextStop()
      router.push('/tour/map')
    }
  }, [isComplete, nextStop, router, stopNarration])

  if (mode === 'loading') {
    return (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Preparing your story...</Text>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>Roam AI</Text>
            <Text style={styles.headerSub}>
              {currentStop?.name}
            </Text>
          </View>
          <View style={{ width: 80 }} />
        </View>

        {/* Narration Card */}
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

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {/* Progress bar + pause/play/replay */}
          <View style={styles.playbackRow}>
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={() => {
                if (narrationStatus === 'playing') pauseNarration()
                else if (narrationStatus === 'paused') resumeNarration()
                else if (narrationStatus === 'idle' && words.length > 0) startNarration(narration, currentStop?.id)
              }}
              disabled={narrationStatus === 'loading'}
            >
              <Text style={styles.playPauseIcon}>
                {narrationStatus === 'playing' ? '\u23F8' : narrationStatus === 'idle' && words.length > 0 ? '\u21BA' : '\u25B6'}
              </Text>
            </TouchableOpacity>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/tour/history')}
            >
              <Text style={styles.secondaryButtonText}>See Past</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.guideButton}
              onPress={handleLiveGuide}
            >
              <Text style={styles.guideButtonIcon}>🎙️</Text>
              <Text style={styles.guideButtonText}>Talk to Guide</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextStop}
          >
            <Text style={styles.nextButtonText}>
              {isComplete ? 'Finish Tour' : `Next: ${nextStopData?.name ?? 'Stop'}`}
            </Text>
            <Text style={styles.nextArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 16,
  },

  // Header
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Text card
  textCard: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  fallbackText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 28,
    color: Colors.textSecondary,
    padding: 20,
  },

  // Controls
  controlsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },

  // Playback controls
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  playPauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  playPauseIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  guideButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.text,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  guideButtonIcon: {
    fontSize: 16,
  },
  guideButtonText: {
    color: '#000',
    fontSize: 15,
    fontFamily: Fonts.bold,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  nextButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  nextArrow: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
})
