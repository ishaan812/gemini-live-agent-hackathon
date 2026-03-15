import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Colors, Fonts } from '../constants/colors'
import {
  useUserStore,
  NARRATION_STYLES,
  LANGUAGES,
  NarrationStyle,
  Language,
} from '../store/userStore'

export default function OnboardingScreen() {
  const router = useRouter()
  const { setName, setNarrationStyle, setLanguage, setOnboarded } = useUserStore()

  const [localName, setLocalName] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<NarrationStyle>('historical')
  const [selectedLang, setSelectedLang] = useState<Language>('en')
  const [step, setStep] = useState(0)

  const handleFinish = () => {
    setName(localName.trim() || 'Explorer')
    setNarrationStyle(selectedStyle)
    setLanguage(selectedLang)
    setOnboarded()
    router.replace('/')
  }

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {step === 0 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>👋</Text>
              </View>
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
          )}

          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>🎭</Text>
              </View>
              <Text style={styles.title}>Pick your vibe</Text>
              <Text style={styles.subtitle}>How should your guide narrate?</Text>
              {NARRATION_STYLES.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.optionCard,
                    selectedStyle === s.value && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedStyle(s.value)}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedStyle === s.value && styles.optionLabelSelected,
                    ]}
                  >
                    {s.label}
                  </Text>
                  <Text style={styles.optionDesc}>{s.desc}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
                <Text style={styles.nextButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>🌐</Text>
              </View>
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
          )}

          {/* Step dots */}
          <View style={styles.dotsRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
            ))}
          </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 30,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 32,
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
  nextButton: {
    backgroundColor: Colors.text,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 999,
    marginTop: 24,
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
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
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
