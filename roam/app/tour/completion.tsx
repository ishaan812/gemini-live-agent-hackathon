import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.celebration} accessible={false}>🎉</Text>
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  celebration: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontFamily: Fonts.extraBold,
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
    backgroundColor: Colors.surface,
    borderRadius: 20,
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
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
  },
  homeButtonText: {
    color: '#000',
    fontSize: 17,
    fontFamily: Fonts.bold,
  },
})
