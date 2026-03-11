import React, { useCallback, useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { AudioPlayer } from '../../components/AudioPlayer'
import { useTour } from '../../hooks/useTour'
import { generateNarration } from '../../services/geminiService'
import { Colors, Fonts } from '../../constants/colors'

export default function StoryScreen() {
  const router = useRouter()
  const { stops, currentStop, currentStopIndex, nextStop, isComplete } = useTour()
  const [narration, setNarration] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const nextStopData = currentStopIndex < stops.length - 1 ? stops[currentStopIndex + 1] : null

  useEffect(() => {
    async function loadNarration() {
      if (!currentStop) return
      setLoading(true)
      const text = await generateNarration(currentStop, nextStopData)
      setNarration(text)
      setLoading(false)
    }
    loadNarration()
  }, [currentStop?.id])

  const handleNextStop = useCallback(() => {
    if (isComplete) {
      router.push('/tour/completion')
    } else {
      nextStop()
      router.push('/tour/map')
    }
  }, [isComplete, nextStop, router])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Preparing your story...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.stopName}>{currentStop?.name}</Text>
        <AudioPlayer text={narration} />
        <Text style={styles.narrationText}>{narration}</Text>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/tour/guide')}
          >
            <Text style={styles.secondaryButtonText}>🎙 Ask Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/tour/history')}
          >
            <Text style={styles.secondaryButtonText}>🏛 See Past</Text>
          </TouchableOpacity>
        </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
  stopName: {
    fontSize: 28,
    fontFamily: Fonts.extraBold,
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  narrationText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 28,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  buttonContainer: {
    padding: 16,
    gap: 10,
    backgroundColor: Colors.primaryLight,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 14,
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
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
})
