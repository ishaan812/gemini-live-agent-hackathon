import React, { useCallback, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native'
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

  const handleCapture = useCallback(async (base64: string) => {
    if (!currentStop) return

    const success = await verify(base64, currentStop)
    if (success) {
      completeCurrentStop()
    }
  }, [currentStop, verify, completeCurrentStop])

  if (verifying) {
    return (
      <View style={styles.statusContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.statusText}>Verifying landmark...</Text>
      </View>
    )
  }

  if (verified === true) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successText}>Landmark Verified!</Text>
        <Text style={styles.confidenceText}>
          Confidence: {Math.round((confidence || 0) * 100)}%
        </Text>
      </View>
    )
  }

  if (verified === false) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.errorIcon}>✗</Text>
        <Text style={styles.errorText}>
          {error || "That doesn't look right. Try again!"}
        </Text>
        <Text
          style={styles.retryButton}
          onPress={reset}
          accessibilityRole="button"
          accessibilityLabel="Retry landmark verification"
        >
          Retry
        </Text>
      </View>
    )
  }

  const handleDevSkip = () => {
    completeCurrentStop()
    router.push('/tour/story')
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Take a photo of {currentStop?.name ?? 'the landmark'}
        </Text>
      </View>
      <CameraViewComponent onCapture={handleCapture} />
      {__DEV__ && (
        <TouchableOpacity
          style={styles.devSkipButton}
          onPress={handleDevSkip}
        >
          <Text style={styles.devSkipText}>Skip (Dev)</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 32,
  },
  statusText: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: Colors.text,
    marginTop: 16,
  },
  successIcon: {
    fontSize: 64,
    color: Colors.success,
  },
  successText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.success,
    marginTop: 16,
  },
  confidenceText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  errorIcon: {
    fontSize: 64,
    color: Colors.error,
  },
  errorText: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.accent,
    marginTop: 24,
    padding: 12,
  },
  devSkipButton: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 999,
  },
  devSkipText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Fonts.bold,
  },
})
