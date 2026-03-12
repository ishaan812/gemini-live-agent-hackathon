import React, { useEffect, useState, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native'
import { useTour } from '../../hooks/useTour'
import { generateHistoryImage } from '../../services/geminiService'
import { Colors, Fonts } from '../../constants/colors'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IMAGE_WIDTH = SCREEN_WIDTH - 40

export default function HistoryScreen() {
  const { currentStop } = useTour()
  const [description, setDescription] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const images = currentStop?.historicalImages ?? []

  useEffect(() => {
    async function loadHistory() {
      if (!currentStop) return
      setLoading(true)
      setCurrentImageIndex(0)
      const text = await generateHistoryImage(currentStop)
      setDescription(text)
      setLoading(false)
    }
    loadHistory()
  }, [currentStop?.id])

  // Auto-rotate images
  useEffect(() => {
    if (images.length <= 1) return

    timerRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [images.length])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Traveling back in time...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{currentStop?.name}</Text>
      <Text style={styles.subtitle}>A Glimpse into the Past</Text>

      {images.length > 0 ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[currentImageIndex] }}
            style={styles.image}
            resizeMode="cover"
          />
          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === currentImageIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}
          <Text style={styles.imageNote}>Historical photographs</Text>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.imagePlaceholder}>🏛️</Text>
          <Text style={styles.imageNote}>Historical Reconstruction</Text>
        </View>
      )}

      <Text style={styles.description}>{description}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  title: {
    fontSize: 28,
    fontFamily: Fonts.extraBold,
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.accent,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH * 0.65,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gray,
  },
  dotActive: {
    backgroundColor: Colors.accent,
    width: 18,
  },
  imageNote: {
    color: Colors.gray,
    fontSize: 12,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    paddingBottom: 10,
  },
  placeholderContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imagePlaceholder: {
    fontSize: 80,
  },
  description: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 28,
    color: Colors.textSecondary,
  },
})
