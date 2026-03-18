import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Colors, Fonts } from '../constants/colors'
import {
  useUserStore,
  GUIDES,
  LANGUAGES,
  NarrationStyle,
  Language,
  Guide,
} from '../store/userStore'
import ModelViewer from '../components/ModelViewer'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const CARD_WIDTH = SCREEN_WIDTH - 48
const CARD_GAP = 14
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP
// Card fills available space between header, dots, and safe area
const CARD_HEIGHT = SCREEN_HEIGHT * 0.65

const PARTICLE_COUNT = 12

const MODEL_MAP: Record<NarrationStyle, number> = {
  historical: require('../assets/models/arjun.glb'),
  funny: require('../assets/models/maya.glb'),
  poetic: require('../assets/models/luna.glb'),
  adventurous: require('../assets/models/rex-v1.glb'),
}

interface Particle {
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
  driftX: number
}

function FloatingParticles() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      size: 3 + Math.random() * 5,
      opacity: 0.15 + Math.random() * 0.25,
      duration: 4000 + Math.random() * 6000,
      delay: Math.random() * 3000,
      driftX: -30 + Math.random() * 60,
    }))
  }, [])

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <FloatingDot key={i} particle={p} />
      ))}
    </View>
  )
}

function FloatingDot({ particle }: { particle: Particle }) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: particle.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: particle.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [])

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  })
  const translateX = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, particle.driftX, 0],
  })
  const opacity = anim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, particle.opacity, particle.opacity, 0],
  })

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: particle.x,
        top: particle.y,
        width: particle.size,
        height: particle.size,
        borderRadius: particle.size / 2,
        backgroundColor: '#6EC6FF',
        opacity,
        transform: [{ translateY }, { translateX }],
      }}
    />
  )
}

function PulsingGlow() {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  })
  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.35],
  })

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 275,
        height: 275,
        borderRadius: 137.5,
        backgroundColor: '#6EC6FF',
        opacity,
        transform: [{ scale }],
      }}
    />
  )
}

function AnimatedLogo() {
  const floatAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  })

  return (
    <View style={styles.logoWrapper}>
      <PulsingGlow />
      <Animated.Image
        source={require('../assets/logo.png')}
        style={[styles.logoImage, { width: 350, height: 350, transform: [{ translateY }] }]}
        resizeMode="contain"
      />
    </View>
  )
}

// -- Guide Carousel Card --
function GuideCard({
  guide,
  isActive,
  onSelect,
}: {
  guide: Guide
  isActive: boolean
  onSelect: () => void
}) {
  const glowAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: isActive ? 1 : 0,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [isActive])

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.10)', guide.color],
  })

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  })

  return (
    <Animated.View
      style={[
        styles.carouselCard,
        {
          borderColor,
          shadowColor: guide.color,
          shadowOpacity,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
        },
      ]}
    >
      {/* Spotlight + 3D Model — takes all remaining space */}
      <View style={styles.spotlightContainer}>
        <LinearGradient
          colors={[
            isActive ? guide.color + '30' : 'transparent',
            'transparent',
          ]}
          style={styles.spotlightGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View
          style={[
            styles.spotlightCone,
            {
              borderBottomColor: isActive
                ? guide.color + '15'
                : 'rgba(255,255,255,0.03)',
            },
          ]}
        />
        <View style={styles.modelContainer}>
          <ModelViewer
            modelAsset={MODEL_MAP[guide.id]}
            accentColor={guide.color}
            width={CARD_WIDTH - 16}
            height={CARD_HEIGHT * 0.55}
            fitScale={2.1}
            yOffset={-0.55}
          />
        </View>
        <View
          style={[
            styles.groundGlow,
            {
              backgroundColor: isActive ? guide.color + '20' : 'transparent',
              shadowColor: guide.color,
              shadowOpacity: isActive ? 0.4 : 0,
              shadowRadius: 30,
            },
          ]}
        />
      </View>

      {/* Character info — fixed height */}
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: guide.color }]}>{guide.name}</Text>
        <Text style={styles.cardTagline} numberOfLines={2}>{guide.desc}</Text>
      </View>

      {/* Select button — always pinned at bottom */}
      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            backgroundColor: isActive ? guide.color : 'rgba(255,255,255,0.08)',
            borderColor: isActive ? guide.color : 'rgba(255,255,255,0.15)',
          },
        ]}
        onPress={onSelect}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.selectButtonText,
            { color: isActive ? '#000' : Colors.textSecondary },
          ]}
        >
          {isActive ? `Choose ${guide.name.split(' ').pop()}` : guide.name.split(' ').pop()}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function OnboardingScreen() {
  const router = useRouter()
  const { setName, setNarrationStyle, setLanguage, setOnboarded } = useUserStore()

  const [localName, setLocalName] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<NarrationStyle>('historical')
  const [selectedLang, setSelectedLang] = useState<Language>('en')
  const [step, setStep] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x
      const index = Math.round(offsetX / SNAP_INTERVAL)
      if (index >= 0 && index < GUIDES.length && index !== activeIndex) {
        setActiveIndex(index)
        setSelectedStyle(GUIDES[index].id)
      }
    },
    [activeIndex]
  )

  const scrollToIndex = useCallback((index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * SNAP_INTERVAL,
      animated: true,
    })
  }, [])

  const handleSelectGuide = useCallback(
    (guide: Guide, index: number) => {
      if (selectedStyle === guide.id && activeIndex === index) {
        // Already selected — confirm and advance to next step
        setStep(2)
      } else {
        setSelectedStyle(guide.id)
        setActiveIndex(index)
        scrollToIndex(index)
      }
    },
    [scrollToIndex, selectedStyle, activeIndex]
  )

  const handleFinish = () => {
    setName(localName.trim() || 'Explorer')
    setNarrationStyle(selectedStyle)
    setLanguage(selectedLang)
    setOnboarded()
    router.replace('/')
  }

  const renderGuideCard = useCallback(
    ({ item, index }: { item: Guide; index: number }) => (
      <GuideCard
        guide={item}
        isActive={activeIndex === index}
        onSelect={() => handleSelectGuide(item, index)}
      />
    ),
    [activeIndex, handleSelectGuide]
  )

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        {step === 0 && (
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.stepContainer}>
              <FloatingParticles />
              <AnimatedLogo />
              <Text style={styles.title}>Welcome to Roam</Text>
              <Text style={styles.subtitle}>What should we call you?</Text>
              <TextInput
                style={styles.nameInput}
                value={localName}
                onChangeText={setLocalName}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.nextButton, !localName.trim() && styles.buttonDim]}
                onPress={() => setStep(1)}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {step === 1 && (
          <View style={styles.carouselStep}>
            <FloatingParticles />

            {/* Header */}
            <View style={styles.carouselHeader}>
              <Text style={styles.title}>Choose your guide</Text>
              <Text style={styles.subtitle}>Swipe to explore</Text>
            </View>

            {/* Horizontal Carousel */}
            <FlatList
              ref={flatListRef}
              data={GUIDES}
              renderItem={renderGuideCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
              }}
              ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              getItemLayout={(_, index) => ({
                length: CARD_WIDTH + CARD_GAP,
                offset: (CARD_WIDTH + CARD_GAP) * index,
                index,
              })}
            />

            {/* Carousel pagination dots */}
            <View style={styles.carouselDots}>
              {GUIDES.map((g, i) => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => {
                    setActiveIndex(i)
                    setSelectedStyle(g.id)
                    scrollToIndex(i)
                  }}
                >
                  <View
                    style={[
                      styles.carouselDot,
                      activeIndex === i && {
                        backgroundColor: g.color,
                        width: 24,
                      },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.stepContainer}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.logoImageSmall}
                resizeMode="contain"
              />
              <Text style={styles.title}>Choose language</Text>
              <Text style={styles.subtitle}>We'll narrate in your language</Text>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.value}
                  style={[
                    styles.optionCard,
                    selectedLang === l.value && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedLang(l.value)}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedLang === l.value && styles.optionLabelSelected,
                    ]}
                  >
                    {l.native}
                  </Text>
                  <Text style={styles.optionDesc}>{l.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.nextButton} onPress={handleFinish}>
                <Text style={styles.nextButtonText}>Let's Go!</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* Step dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
          ))}
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
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stepContainer: {
    alignItems: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  logoImageSmall: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  nameInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontSize: 18,
    fontFamily: Fonts.regular,
    color: Colors.text,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  // -- Carousel step layout --
  carouselStep: {
    flex: 1,
  },
  carouselHeader: {
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'center',
  },

  // -- Carousel card --
  carouselCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },

  // -- Spotlight effects --
  spotlightContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  spotlightGradient: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  spotlightCone: {
    position: 'absolute',
    top: -20,
    width: 0,
    height: 0,
    borderLeftWidth: 80,
    borderRightWidth: 80,
    borderBottomWidth: 200,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.03)',
    opacity: 0.6,
  },
  modelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  groundGlow: {
    position: 'absolute',
    bottom: 10,
    width: 118,
    height: 14,
    borderRadius: 59,
    shadowOffset: { width: 0, height: 0 },
  },

  // -- Card info --
  cardInfo: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 2,
  },
  cardName: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    marginBottom: 2,
    textAlign: 'center',
  },
  cardTagline: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  cardDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
  },
  cardFullDesc: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    lineHeight: 19,
    textAlign: 'center',
  },

  // -- Select button --
  selectButton: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 14,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
  },
  selectButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },

  // -- Carousel pagination --
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },

  // -- Carousel footer --
  carouselFooter: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },

  // -- Language options --
  optionCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  optionCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  optionLabel: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: Colors.accent,
  },
  optionDesc: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },

  // -- Shared buttons --
  nextButton: {
    backgroundColor: Colors.text,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 999,
    width: '100%',
    alignItems: 'center',
  },
  buttonDim: {
    opacity: 0.4,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 17,
    fontFamily: Fonts.bold,
  },

  // -- Step dots --
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: {
    backgroundColor: Colors.text,
    width: 24,
  },
})
