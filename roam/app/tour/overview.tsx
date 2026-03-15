import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useTour } from '../../hooks/useTour'
import { Colors, Fonts } from '../../constants/colors'
import { COLABA_TOUR } from '../../constants/config'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function TourOverviewScreen() {
  const router = useRouter()
  const { stops, completedStops, currentStopIndex, isComplete, goToStop } = useTour()

  const handleStopPress = (index: number) => {
    goToStop(index)
    router.push('/tour/map')
  }

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800' }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', Colors.gradientStart]}
          style={styles.heroGradient}
        />
        <SafeAreaView style={styles.heroOverlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Content */}
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        style={styles.contentGradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Tour Title */}
          <Text style={styles.tourName}>{COLABA_TOUR.name}</Text>

          {/* Stat Pills */}
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>1.8K</Text>
              <Text style={styles.statLabel}>Visitors</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{COLABA_TOUR.distance}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{stops.length}</Text>
              <Text style={styles.statLabel}>Stops</Text>
            </View>
          </View>

          {/* About */}
          <View style={styles.glassCard}>
            <Text style={styles.cardTitle}>About the Tour</Text>
            <Text style={styles.cardBody}>
              Walk through the historic Colaba district, from the majestic Gateway of India to the
              cultural heart of Kala Ghoda. Experience colonial-era architecture, bustling markets,
              and hidden gems along the way. Each stop is verified with AI-powered landmark
              recognition and narrated by your personal guide.
            </Text>
          </View>

          {/* Route */}
          <View style={styles.glassCard}>
            <Text style={styles.cardTitle}>Route</Text>
            <View style={styles.timeline}>
              {stops.map((stop, index) => {
                const isCompleted = completedStops.includes(stop.id)
                const isCurrent = index === currentStopIndex
                const isLast = index === stops.length - 1

                return (
                  <TouchableOpacity
                    key={stop.id}
                    style={styles.timelineItem}
                    onPress={() => handleStopPress(index)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.dot,
                          isCompleted && styles.dotCompleted,
                          isCurrent && !isCompleted && styles.dotCurrent,
                        ]}
                      >
                        {isCompleted ? (
                          <Text style={styles.checkmark}>✓</Text>
                        ) : (
                          <Text
                            style={[
                              styles.dotNumber,
                              isCurrent && styles.dotNumberCurrent,
                            ]}
                          >
                            {index + 1}
                          </Text>
                        )}
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.connector,
                            isCompleted && styles.connectorCompleted,
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.stopInfo}>
                      <Text
                        style={[
                          styles.stopName,
                          isCompleted && styles.stopNameCompleted,
                          isCurrent && !isCompleted && styles.stopNameCurrent,
                        ]}
                      >
                        {stop.name}
                      </Text>
                      <Text style={styles.stopDesc} numberOfLines={1}>
                        {stop.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/tour/map')}
            activeOpacity={0.85}
          >
            <Text style={styles.startButtonIcon}>🚶</Text>
            <Text style={styles.startButtonText}>
              {isComplete
                ? 'View Tour Complete'
                : completedStops.length > 0
                  ? 'Continue Tour'
                  : 'Start Tour'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gradientStart,
  },

  // Hero
  heroContainer: {
    height: 260,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginLeft: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  // Content
  contentGradient: {
    flex: 1,
    marginTop: -40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 28,
  },

  // Title
  tourName: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  statPill: {
    backgroundColor: Colors.glass,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    minWidth: 80,
  },
  statValue: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Glass Cards
  glassCard: {
    backgroundColor: Colors.glass,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    marginBottom: 12,
  },
  cardBody: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Timeline
  timeline: {
    marginTop: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 36,
    marginRight: 14,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.glassLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
  },
  dotCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  dotCurrent: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  dotNumber: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.textSecondary,
  },
  dotNumberCurrent: {
    color: Colors.accent,
  },
  checkmark: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#fff',
  },
  connector: {
    width: 2,
    height: 28,
    backgroundColor: Colors.glassBorder,
    marginVertical: 4,
  },
  connectorCompleted: {
    backgroundColor: Colors.success,
  },
  stopInfo: {
    flex: 1,
    paddingVertical: 4,
  },
  stopName: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    marginBottom: 2,
  },
  stopNameCompleted: {
    color: Colors.success,
  },
  stopNameCurrent: {
    color: Colors.accent,
  },
  stopDesc: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: 'rgba(15,32,39,0.9)',
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: Colors.text,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonIcon: {
    fontSize: 18,
  },
  startButtonText: {
    color: '#000',
    fontSize: 17,
    fontFamily: Fonts.bold,
  },
})
