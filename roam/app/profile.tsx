import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Colors, Fonts, GlassCard } from '../constants/colors'
import { COLABA_TOUR, COLABA_STOPS } from '../constants/config'
// Tour data is now dynamic via tourStore
import {
  useUserStore,
  GUIDES,
  LANGUAGES,
} from '../store/userStore'
import { useTourStore } from '../store/tourStore'

const TROPHY_DATA: Record<string, { name: string; icon: string; desc: string }> = {
  'colaba-heritage-walk': {
    name: 'Colaba Explorer',
    icon: '🏛️',
    desc: 'Completed the Colaba Heritage Walk',
  },
  'marine-drive': {
    name: 'Sunset Chaser',
    icon: '🌅',
    desc: 'Completed the Marine Drive Sunset tour',
  },
  'cst-heritage': {
    name: 'Fort District Pro',
    icon: '🏰',
    desc: 'Completed the CST & Fort Walk',
  },
  'mumbai-street-eats': {
    name: 'Street Food Connoisseur',
    icon: '🍜',
    desc: 'Completed Mumbai Street Eats',
  },
  'dharavi-art-walk': {
    name: 'Dharavi Explorer',
    icon: '🎨',
    desc: 'Completed the Dharavi Art Walk',
  },
  'bandra-art': {
    name: 'Art Aficionado',
    icon: '🎨',
    desc: 'Completed Bandra Street Art tour',
  },
}

export default function ProfileScreen() {
  const router = useRouter()
  const store = useUserStore()
  const tourStore = useTourStore()
  const [editName, setEditName] = useState(store.name)

  const handleNameSave = () => {
    if (editName.trim()) store.setName(editName.trim())
  }

  const currentGuide = GUIDES.find((g) => g.id === store.narrationStyle) || GUIDES[0]

  // Tour progress
  const hasActiveTour = tourStore.stops.length > 0
  const activeTourName = tourStore.tourMeta?.name || COLABA_TOUR.name
  const activeTourDistance = tourStore.tourMeta?.distance || COLABA_TOUR.distance
  const totalStops = hasActiveTour ? tourStore.stops.length : COLABA_STOPS.length
  const completedStopsCount = tourStore.completedStops.length
  const progressPercent = hasActiveTour
    ? Math.round((completedStopsCount / totalStops) * 100)
    : 0

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <Image
              source={require('../assets/logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={[styles.avatarRing, { borderColor: currentGuide.color }]}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {store.name ? store.name[0].toUpperCase() : '?'}
                </Text>
              </View>
            </View>
            <TextInput
              style={styles.nameInput}
              value={editName}
              onChangeText={setEditName}
              onBlur={handleNameSave}
              onSubmitEditing={handleNameSave}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
              textAlign="center"
            />
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{store.completedTours.length}</Text>
                <Text style={styles.statLabel}>Tours</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{store.completedTours.length}</Text>
                <Text style={styles.statLabel}>Trophies</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {store.completedTours.length * 5 + completedStopsCount}
                </Text>
                <Text style={styles.statLabel}>Stops</Text>
              </View>
            </View>
          </View>

          {/* Active Tour */}
          <Text style={styles.sectionTitle}>Active Tour</Text>
          {hasActiveTour ? (
            <TouchableOpacity
              style={styles.activeTourCard}
              activeOpacity={0.85}
              onPress={() => router.push('/tour/overview')}
            >
              <View style={styles.activeTourHeader}>
                <View>
                  <Text style={styles.activeTourName}>{activeTourName}</Text>
                  <Text style={styles.activeTourMeta}>
                    {activeTourDistance} · {totalStops} stops
                  </Text>
                </View>
                <View style={styles.activeTourBadge}>
                  <Text style={styles.activeTourBadgeText}>IN PROGRESS</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.max(progressPercent, 4)}%` },
                  ]}
                />
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  {completedStopsCount} of {totalStops} stops completed
                </Text>
                <Text style={styles.progressPercent}>{progressPercent}%</Text>
              </View>

              {/* Stop dots */}
              <View style={styles.stopDotsRow}>
                {tourStore.stops.map((stop, i) => {
                  const isCompleted = tourStore.completedStops.includes(stop.id)
                  const isCurrent = i === tourStore.currentStopIndex
                  return (
                    <View key={stop.id} style={styles.stopDotWrapper}>
                      <View
                        style={[
                          styles.stopDot,
                          isCompleted && styles.stopDotCompleted,
                          isCurrent && styles.stopDotCurrent,
                        ]}
                      />
                      <Text
                        style={[
                          styles.stopDotLabel,
                          isCompleted && styles.stopDotLabelCompleted,
                          isCurrent && styles.stopDotLabelCurrent,
                        ]}
                        numberOfLines={1}
                      >
                        {stop.name.split(' ')[0]}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.noTourCard}
              activeOpacity={0.85}
              onPress={() => router.push('/tour/overview')}
            >
              <Text style={styles.noTourIcon}>🗺️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.noTourText}>No active tour</Text>
                <Text style={styles.noTourSub}>
                  Browse tours on the home screen to begin exploring!
                </Text>
              </View>
              <Text style={styles.noTourArrow}>›</Text>
            </TouchableOpacity>
          )}

          {/* Trophies */}
          <Text style={styles.sectionTitle}>Trophies</Text>
          {store.completedTours.length > 0 ? (
            <View style={styles.trophyGrid}>
              {store.completedTours.map((tourId) => {
                const trophy = TROPHY_DATA[tourId] || {
                  name: 'Explorer',
                  icon: '🏆',
                  desc: `Completed ${tourId}`,
                }
                return (
                  <View key={tourId} style={styles.trophyCard}>
                    <View style={styles.trophyIconCircle}>
                      <Text style={styles.trophyIcon}>{trophy.icon}</Text>
                    </View>
                    <Text style={styles.trophyName}>{trophy.name}</Text>
                    <Text style={styles.trophyDesc}>{trophy.desc}</Text>
                  </View>
                )
              })}
            </View>
          ) : (
            <View style={styles.emptyTrophyCard}>
              <Text style={styles.emptyTrophyIcon}>🏆</Text>
              <Text style={styles.emptyTrophyText}>No trophies yet</Text>
              <Text style={styles.emptyTrophySub}>
                Complete tours to earn trophies and badges!
              </Text>
            </View>
          )}

          {/* Guide Selection */}
          <Text style={styles.sectionTitle}>Your Guide</Text>
          <View style={styles.currentGuideCard}>
            <View
              style={[
                styles.guideAvatarLarge,
                { backgroundColor: currentGuide.colorDim, borderColor: currentGuide.color },
              ]}
            >
              <Text style={styles.guideAvatarLargeText}>{currentGuide.avatar}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.currentGuideName, { color: currentGuide.color }]}>
                {currentGuide.name}
              </Text>
              <Text style={styles.currentGuideDesc}>{currentGuide.desc}</Text>
            </View>
          </View>

          <View style={styles.guideRow}>
            {GUIDES.map((g) => {
              const isSelected = store.narrationStyle === g.id
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.guideChip,
                    isSelected && { borderColor: g.color, backgroundColor: g.colorDim },
                  ]}
                  onPress={() => store.setNarrationStyle(g.id)}
                >
                  <Text style={styles.guideChipAvatar}>{g.avatar}</Text>
                  <Text
                    style={[
                      styles.guideChipName,
                      isSelected && { color: g.color },
                    ]}
                  >
                    {g.name.split(' ').pop()}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Language */}
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.langRow}>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.value}
                style={[
                  styles.langChip,
                  store.language === l.value && styles.langChipSelected,
                ]}
                onPress={() => store.setLanguage(l.value)}
              >
                <Text
                  style={[
                    styles.langText,
                    store.language === l.value && styles.langTextSelected,
                  ]}
                >
                  {l.native}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
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
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: Fonts.semiBold,
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
  headerLogo: {
    width: 36,
    height: 36,
  },

  // Profile Card
  profileCard: {
    ...GlassCard,
    alignItems: 'center',
    padding: 24,
    marginBottom: 8,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.glassMedium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  nameInput: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.text,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 18,
    minWidth: 120,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.accent,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.glassBorder,
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 14,
  },

  // Active Tour
  activeTourCard: {
    ...GlassCard,
    padding: 18,
  },
  activeTourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  activeTourName: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  activeTourMeta: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeTourBadge: {
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  activeTourBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: Colors.accent,
    letterSpacing: 1,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  progressPercent: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: Colors.accent,
  },
  stopDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 4,
  },
  stopDotWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 4,
  },
  stopDotCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stopDotCurrent: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  stopDotLabel: {
    fontSize: 9,
    fontFamily: Fonts.medium,
    color: Colors.textMuted,
  },
  stopDotLabelCompleted: {
    color: Colors.success,
  },
  stopDotLabelCurrent: {
    color: Colors.accent,
  },

  // No tour
  noTourCard: {
    ...GlassCard,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  noTourIcon: {
    fontSize: 32,
  },
  noTourText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
  noTourSub: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  noTourArrow: {
    fontSize: 24,
    color: Colors.textMuted,
  },

  // Trophies
  trophyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trophyCard: {
    ...GlassCard,
    width: '47%' as any,
    alignItems: 'center',
    padding: 18,
    borderColor: Colors.accentSoft,
  },
  trophyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  trophyIcon: {
    fontSize: 28,
  },
  trophyName: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.accent,
    textAlign: 'center',
  },
  trophyDesc: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  emptyTrophyCard: {
    ...GlassCard,
    alignItems: 'center',
    padding: 28,
  },
  emptyTrophyIcon: {
    fontSize: 40,
    marginBottom: 10,
    opacity: 0.4,
  },
  emptyTrophyText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
  },
  emptyTrophySub: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },

  // Guide
  currentGuideCard: {
    ...GlassCard,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    marginBottom: 12,
  },
  guideAvatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  guideAvatarLargeText: {
    fontSize: 28,
  },
  currentGuideName: {
    fontSize: 17,
    fontFamily: Fonts.bold,
  },
  currentGuideDesc: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  guideRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  guideChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    gap: 6,
  },
  guideChipAvatar: {
    fontSize: 20,
  },
  guideChipName: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },

  // Language
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  langChip: {
    backgroundColor: Colors.glass,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  langChipSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  langText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
  langTextSelected: {
    color: Colors.accent,
  },
})
