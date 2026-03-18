import React, { useEffect, useState, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useTour } from '../../hooks/useTour'
import { generateHistoryImage } from '../../services/geminiService'
import { Colors, Fonts } from '../../constants/colors'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IMAGE_WIDTH = SCREEN_WIDTH - 48

export default function HistoryScreen() {
  const router = useRouter()
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
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Traveling back in time...</Text>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
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

        <View style={styles.descriptionCard}>
          <Text style={styles.description}>{description}</Text>
        </View>
      </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginLeft: 16,
    marginTop: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
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
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: Colors.text,
    width: 18,
  },
  imageNote: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    paddingBottom: 10,
  },
  placeholderContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  imagePlaceholder: {
    fontSize: 80,
  },
  descriptionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 20,
  },
  description: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 28,
    color: Colors.textSecondary,
  },
})
