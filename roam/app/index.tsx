import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Fonts } from '../constants/colors'
import { COLABA_TOUR } from '../constants/config'
import { useUserStore } from '../store/userStore'

export default function HomeScreen() {
  const router = useRouter()
  const name = useUserStore((s) => s.name)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Hey, {name || 'Explorer'}</Text>
          <Text style={styles.subtitle}>Where to next?</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.profileInitial}>
            {name ? name[0].toUpperCase() : '?'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tourCard}>
        <View style={styles.tourBadge}>
          <Text style={styles.tourBadgeText}>FEATURED</Text>
        </View>
        <Text style={styles.tourName}>{COLABA_TOUR.name}</Text>
        <Text style={styles.tourDescription}>{COLABA_TOUR.description}</Text>
        <View style={styles.tourMeta}>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>{COLABA_TOUR.distance}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>{COLABA_TOUR.stops.length} Stops</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/tour/overview')}
        >
          <Text style={styles.startButtonText}>Start Tour</Text>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontFamily: Fonts.extraBold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    color: '#000',
  },
  tourCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tourBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 14,
  },
  tourBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.extraBold,
    color: Colors.accent,
    letterSpacing: 1,
  },
  tourName: {
    fontSize: 24,
    fontFamily: Fonts.extraBold,
    color: Colors.text,
    marginBottom: 8,
  },
  tourDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  tourMeta: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  metaChip: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  metaText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
  },
  startButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#000',
    fontSize: 17,
    fontFamily: Fonts.bold,
  },
})
