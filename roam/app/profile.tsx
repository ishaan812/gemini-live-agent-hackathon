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
import { Colors, Fonts } from '../constants/colors'
import {
  useUserStore,
  NARRATION_STYLES,
  LANGUAGES,
} from '../store/userStore'

export default function ProfileScreen() {
  const store = useUserStore()
  const [editName, setEditName] = useState(store.name)

  const handleNameSave = () => {
    if (editName.trim()) store.setName(editName.trim())
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {store.name ? store.name[0].toUpperCase() : '?'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Name</Text>
        <View style={styles.nameRow}>
          <TextInput
            style={styles.nameInput}
            value={editName}
            onChangeText={setEditName}
            onBlur={handleNameSave}
            placeholder="Your name"
            placeholderTextColor={Colors.gray}
          />
        </View>

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
            <Text style={[styles.optionLabel, store.narrationStyle === s.value && styles.optionLabelSelected]}>
              {s.label}
            </Text>
            <Text style={styles.optionDesc}>{s.desc}</Text>
          </TouchableOpacity>
        ))}

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
              <Text style={[styles.langText, store.language === l.value && styles.langTextSelected]}>
                {l.native}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 24,
    paddingBottom: 60,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontFamily: Fonts.extraBold,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
  },
  nameInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    fontFamily: Fonts.regular,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
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
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  langChip: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
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
  trophyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
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
