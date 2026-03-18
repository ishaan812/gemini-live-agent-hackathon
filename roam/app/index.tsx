import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Colors, Fonts } from '../constants/colors'
import { COLABA_TOUR, getTourById } from '../constants/config'
import { useUserStore } from '../store/userStore'
import { useTourStore } from '../store/tourStore'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const CATEGORIES = [
  { id: 'heritage', label: 'Heritage', icon: '🏛️' },
  { id: 'food', label: 'Food', icon: '🍜' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'night', label: 'Nightlife', icon: '🌙' },
]

const POPULAR_TOURS = [
  {
    id: 'marine-drive',
    name: 'Marine Drive Sunset',
    location: 'Marine Drive, Mumbai',
    distance: '2.4 km',
    stops: 4,
    duration: '1.5 hrs',
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600',
    category: 'nature',
  },
  {
    id: 'cst-heritage',
    name: 'CST & Fort Walk',
    location: 'Fort District, Mumbai',
    distance: '3.1 km',
    stops: 6,
    duration: '2 hrs',
    image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600',
    category: 'heritage',
  },
  {
    id: 'mumbai-street-eats',
    name: 'Mumbai Street Eats',
    location: 'Mohammad Ali Road',
    distance: '1.2 km',
    stops: 8,
    duration: '2.5 hrs',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',
    category: 'food',
  },
  {
    id: 'bandra-art',
    name: 'Bandra Street Art',
    location: 'Bandra West, Mumbai',
    distance: '2.8 km',
    stops: 7,
    duration: '2 hrs',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600',
    category: 'art',
  },
]

const NEARBY_EXPERIENCES = [
  {
    id: 'dharavi-art-walk',
    name: 'Dharavi Art Walk',
    subtitle: 'Explore local artisans & street art',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=400',
  },
  {
    id: 'elephanta',
    name: 'Elephanta Caves',
    subtitle: 'Ancient rock-cut temples',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
  },
  {
    id: 'sassoon',
    name: 'Sassoon Docks',
    subtitle: 'Art meets fishing harbor',
    rating: '4.5',
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400',
  },
]

export default function HomeScreen() {
  const router = useRouter()
  const name = useUserStore((s) => s.name)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const setTour = useTourStore((s) => s.setTour)

  const handleUnavailable = () => {
    Alert.alert('Coming Soon', 'This tour is not available yet. Stay tuned!')
  }

  const navigateToTour = (tourId: string) => {
    const tour = getTourById(tourId)
    if (tour) {
      setTour(
        {
          id: tour.id,
          name: tour.name,
          description: tour.description,
          distance: tour.distance,
          duration: tour.duration,
          image: tour.image,
          about: tour.about,
        },
        tour.stops,
      )
      router.push('/tour/overview')
    } else {
      handleUnavailable()
    }
  }

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.greetingSmall}>Good Morning</Text>
                <Text style={styles.userName}>{name || 'Explorer'}</Text>
              </View>
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

          {/* Tagline */}
          <Text style={styles.tagline}>Where will you{'\n'}explore today?</Text>

          {/* Search Bar */}
          <TouchableOpacity style={styles.searchBar} onPress={handleUnavailable}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search destinations...</Text>
          </TouchableOpacity>

          {/* Featured Tour */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Tour</Text>
            <TouchableOpacity onPress={handleUnavailable}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.featuredCard}
            activeOpacity={0.85}
            onPress={() => navigateToTour(COLABA_TOUR.id)}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800' }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.75)']}
              style={styles.featuredOverlay}
            />
            <View style={styles.featuredContent}>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>FEATURED</Text>
              </View>
              <Text style={styles.featuredName}>{COLABA_TOUR.name}</Text>
              <Text style={styles.featuredDesc}>
                Explore the historic Colaba district of Mumbai
              </Text>
              <View style={styles.featuredMeta}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>{COLABA_TOUR.distance}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>
                    {COLABA_TOUR.stops.length} Stops
                  </Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>~1 hr</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Categories */}
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => {
                  setSelectedCategory(
                    selectedCategory === cat.id ? null : cat.id,
                  )
                  handleUnavailable()
                }}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === cat.id && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Popular Tours */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Tours</Text>
            <TouchableOpacity onPress={handleUnavailable}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {POPULAR_TOURS.map((tour) => (
              <TouchableOpacity
                key={tour.id}
                style={styles.tourMiniCard}
                activeOpacity={0.8}
                onPress={() => navigateToTour(tour.id)}
              >
                <Image
                  source={{ uri: tour.image }}
                  style={styles.tourMiniImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.tourMiniOverlay}
                />
                <View style={styles.tourMiniContent}>
                  <Text style={styles.tourMiniName}>{tour.name}</Text>
                  <Text style={styles.tourMiniLocation}>{tour.location}</Text>
                  <View style={styles.tourMiniMeta}>
                    <Text style={styles.tourMiniMetaText}>{tour.distance}</Text>
                    <Text style={styles.tourMiniDot}>·</Text>
                    <Text style={styles.tourMiniMetaText}>{tour.stops} stops</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Nearby Experiences */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Experiences</Text>
            <TouchableOpacity onPress={handleUnavailable}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {NEARBY_EXPERIENCES.map((exp) => (
            <TouchableOpacity
              key={exp.id}
              style={styles.experienceCard}
              activeOpacity={0.8}
              onPress={() => navigateToTour(exp.id)}
            >
              <Image
                source={{ uri: exp.image }}
                style={styles.experienceImage}
                resizeMode="cover"
              />
              <View style={styles.experienceInfo}>
                <Text style={styles.experienceName}>{exp.name}</Text>
                <Text style={styles.experienceSubtitle}>{exp.subtitle}</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingStar}>★</Text>
                  <Text style={styles.ratingText}>{exp.rating}</Text>
                </View>
              </View>
              <Text style={styles.experienceArrow}>›</Text>
            </TouchableOpacity>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={styles.tabIconActive}>🏠</Text>
            <Text style={styles.tabLabelActive}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={handleUnavailable}>
            <Text style={styles.tabIcon}>🔍</Text>
            <Text style={styles.tabLabel}>Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={handleUnavailable}>
            <Text style={styles.tabIcon}>🗺️</Text>
            <Text style={styles.tabLabel}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.tabIcon}>👤</Text>
            <Text style={styles.tabLabel}>Profile</Text>
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
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  greetingSmall: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.glassMedium,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },

  // Tagline
  tagline: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.text,
    lineHeight: 36,
    marginBottom: 20,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: 28,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.accent,
    marginBottom: 14,
  },

  // Featured Card
  featuredCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 28,
    height: 220,
    backgroundColor: Colors.glass,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 8,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: Colors.accent,
    letterSpacing: 1.2,
  },
  featuredName: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  metaPillText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.9)',
  },

  // Categories
  categoriesRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  categoryLabelActive: {
    color: Colors.accent,
  },

  // Popular Tours (horizontal)
  horizontalList: {
    gap: 14,
    paddingBottom: 4,
  },
  tourMiniCard: {
    width: SCREEN_WIDTH * 0.42,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.glass,
  },
  tourMiniImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  tourMiniOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  tourMiniContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  tourMiniName: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  tourMiniLocation: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 6,
  },
  tourMiniMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tourMiniMetaText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.75)',
  },
  tourMiniDot: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },

  // Nearby Experiences (list)
  experienceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 12,
    marginBottom: 12,
  },
  experienceImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  experienceInfo: {
    flex: 1,
    marginLeft: 14,
  },
  experienceName: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
  experienceSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingStar: {
    fontSize: 13,
    color: Colors.accent,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.accent,
  },
  experienceArrow: {
    fontSize: 22,
    color: Colors.textMuted,
    marginRight: 4,
  },

  // Bottom Tab Bar
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(15,32,39,0.92)',
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    paddingTop: 10,
    paddingBottom: 28,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconActive: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.textMuted,
  },
  tabLabelActive: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.text,
  },
})
