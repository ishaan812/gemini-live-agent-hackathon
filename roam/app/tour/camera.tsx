import React, { useCallback, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { CameraViewComponent } from '../../components/CameraView'
import { useCameraVerification } from '../../hooks/useCameraVerification'
import { useTour } from '../../hooks/useTour'
import { Colors, Fonts } from '../../constants/colors'

export default function CameraScreen() {
  const router = useRouter()
  const { currentStop, completeCurrentStop } = useTour()
  const { verifying, verified, confidence, error, verify, reset } =
    useCameraVerification()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (verified === true) {
      timeoutRef.current = setTimeout(() => {
        router.push('/tour/story')
      }, 1500)
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [verified, router])

  const handleCapture = useCallback(
    async (base64: string) => {
      if (!currentStop) return

      const success = await verify(base64, currentStop)
      if (success) {
        completeCurrentStop()
      }
    },
    [currentStop, verify, completeCurrentStop],
  )

  const handleSkip = () => {
    completeCurrentStop()
    router.push('/tour/story')
  }

  if (verifying) {
    return (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        style={styles.statusContainer}
      >
        <View style={styles.glassCard}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.statusText}>Verifying landmark...</Text>
        </View>
      </LinearGradient>
    )
  }

  if (verified === true) {
    return (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        style={styles.statusContainer}
      >
        <View style={[styles.glassCard, styles.glassCardSuccess]}>
          <View style={styles.successCircle}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={styles.successText}>Landmark Verified!</Text>
          <Text style={styles.confidenceText}>
            Confidence: {Math.round((confidence || 0) * 100)}%
          </Text>
        </View>
      </LinearGradient>
    )
  }

  if (verified === false) {
    return (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        style={styles.statusContainer}
      >
        <View style={[styles.glassCard, styles.glassCardError]}>
          <View style={styles.errorCircle}>
            <Text style={styles.errorIcon}>✗</Text>
          </View>
          <Text style={styles.errorText}>
            {error || "That doesn't look right. Try again!"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={reset}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    )
  }

  return (
    <View style={styles.container}>
      <CameraViewComponent onCapture={handleCapture} />

      {/* Top buttons row — each button positioned independently */}
      <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.topRow} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.pillButton}
            onPress={() => router.back()}
          >
            <Text style={styles.pillButtonText}>‹ Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pillButton} onPress={handleSkip}>
            <Text style={styles.pillButtonText}>Skip ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRow} pointerEvents="none">
          <View style={styles.headerGlass}>
            <Text style={styles.headerText}>
              Point at {currentStop?.name ?? 'the landmark'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Top overlay
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pillButton: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pillButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  headerRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  headerGlass: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.medium,
  },

  // Status screens
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 40,
    alignItems: 'center',
    width: '100%',
  },
  glassCardSuccess: {
    borderColor: 'rgba(74,222,128,0.3)',
  },
  glassCardError: {
    borderColor: 'rgba(248,113,113,0.3)',
  },
  statusText: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: Colors.text,
    marginTop: 20,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(74,222,128,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  successIcon: {
    fontSize: 36,
    color: Colors.success,
    fontFamily: Fonts.bold,
  },
  successText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.success,
    marginTop: 12,
  },
  confidenceText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  errorCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(248,113,113,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorIcon: {
    fontSize: 36,
    color: Colors.error,
    fontFamily: Fonts.bold,
  },
  errorText: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
})
