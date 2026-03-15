import React, { useCallback, useEffect, useState } from 'react'
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
    currentWordIndex,
    words,
    start: startNarration,
    pause: pauseNarration,
    stop: stopNarration,
  } = useNarrationPlayback()

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
    }
  }, [currentStop?.id])

  const handleLiveGuide = useCallback(() => {
    pauseNarration()
    connection.connect()
    router.push('/tour/assistant')
  }, [pauseNarration, connection, router])

  const handleNextStop = useCallback(() => {
    stopNarration()
    if (isComplete) {
      router.push('/tour/completion')
    } else {
      nextStop()
      router.push('/tour/map')
    }
  }, [isComplete, nextStop, router, stopNarration])

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
      {/* TOP: Stop name */}
      <View style={styles.headerSection}>
        <Text style={styles.stopName}>{currentStop?.name}</Text>
      </View>

      {/* MIDDLE: Text card */}
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
          style={styles.guideButton}
          onPress={handleLiveGuide}
        >
          <Text style={styles.guideButtonText}>Live Guide</Text>
        </TouchableOpacity>
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

  // Top section — header
  headerSection: {
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  stopName: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
  },

  // Middle section — text card
  textCard: {
    flex: 1,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    paddingBottom: 16,
  },
  guideButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  guideButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: Fonts.bold,
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
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
})
