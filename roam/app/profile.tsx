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
} from '../store/userStore'

export default function ProfileScreen() {
  const router = useRouter()
  const store = useUserStore()
  const [editName, setEditName] = useState(store.name)

  const handleNameSave = () => {
    if (editName.trim()) store.setName(editName.trim())
  }

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {store.name ? store.name[0].toUpperCase() : '?'}
              </Text>
            </View>
          </View>

          {/* Name */}
          <Text style={styles.sectionTitle}>Name</Text>
          <View style={styles.nameRow}>
            <TextInput
              style={styles.nameInput}
              value={editName}
              onChangeText={setEditName}
              onBlur={handleNameSave}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Narration Style */}
          <Text style={styles.sectionTitle}>Narration Style</Text>
          {NARRATION_STYLES.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[
                styles.optionCard,
                store.narrationStyle === s.value && styles.optionCardSelected,
              ]}
              onPress={() => store.setNarrationStyle(s.value)}
            >
              <Text
                style={[
                  styles.optionLabel,
                  store.narrationStyle === s.value && styles.optionLabelSelected,
                ]}
              >
                {s.label}
              </Text>
              <Text style={styles.optionDesc}>{s.desc}</Text>
            </TouchableOpacity>
          ))}

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

          {/* Trophies */}
          {store.completedTours.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Trophies</Text>
              {store.completedTours.map((tourId) => (
                <View key={tourId} style={styles.trophyCard}>
                  <Text style={styles.trophyIcon}>🏆</Text>
                  <View>
                    <Text style={styles.trophyName}>Colaba Explorer</Text>
                    <Text style={styles.trophyDesc}>Completed {tourId}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
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
    padding: 24,
    paddingBottom: 60,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },

  // Avatar
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },

  // Section
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 12,
  },

  // Name
  nameRow: {
    flexDirection: 'row',
  },
  nameInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 17,
    fontFamily: Fonts.regular,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  // Options
  optionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  optionCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  optionLabel: {
    fontSize: 16,
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

  // Language
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  langChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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

  // Trophies
  trophyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  trophyIcon: {
    fontSize: 36,
  },
  trophyName: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: Colors.accent,
  },
  trophyDesc: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
})
