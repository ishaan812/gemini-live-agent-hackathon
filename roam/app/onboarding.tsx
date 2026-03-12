import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
} from 'react-native'
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>Welcome to Roam</Text>
            <Text style={styles.subtitle}>What should we call you?</Text>
            <TextInput
              style={styles.nameInput}
              value={localName}
              onChangeText={setLocalName}
              placeholder="Your name"
              placeholderTextColor={Colors.gray}
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
            <Text style={styles.emoji}>🎭</Text>
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
                <Text style={[styles.optionLabel, selectedStyle === s.value && styles.optionLabelSelected]}>
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
            <Text style={styles.emoji}>🌐</Text>
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
                <Text style={[styles.optionLabel, selectedLang === l.value && styles.optionLabelSelected]}>
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stepContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.extraBold,
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
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    fontFamily: Fonts.regular,
    color: Colors.text,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
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
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  buttonDim: {
    opacity: 0.5,
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
    backgroundColor: Colors.surfaceLight,
  },
  dotActive: {
    backgroundColor: Colors.accent,
    width: 24,
  },
})
