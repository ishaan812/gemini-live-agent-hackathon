import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useTour } from '../../hooks/useTour'
import { useUserStore } from '../../store/userStore'
import { Colors, Fonts } from '../../constants/colors'
import { COLABA_TOUR } from '../../constants/config'

export default function CompletionScreen() {
  const router = useRouter()
  const { resetTour } = useTour()
  const addCompletedTour = useUserStore((s) => s.addCompletedTour)

  function handleReturnHome() {
    addCompletedTour(COLABA_TOUR.id)
    resetTour()
    router.replace('/')
  }

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.celebrationCircle}>
            <Text style={styles.celebration} accessible={false}>🎉</Text>
          </View>
          <Text style={styles.title}>Tour Complete!</Text>
          <Text style={styles.subtitle}>
            You explored the Colaba Heritage Walk
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeIcon} accessible={false}>🏆</Text>
            <Text style={styles.badgeName}>Colaba Explorer</Text>
            <Text style={styles.badgeDescription}>
              Completed all 5 heritage stops
            </Text>
          </View>

          <TouchableOpacity style={styles.homeButton} onPress={handleReturnHome}>
            <Text style={styles.homeButtonText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  celebrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  celebration: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 40,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.accent,
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  homeButton: {
    backgroundColor: Colors.text,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 999,
  },
  homeButtonText: {
    color: '#000',
    fontSize: 17,
    fontFamily: Fonts.bold,
  },
})
