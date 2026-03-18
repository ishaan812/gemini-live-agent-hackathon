import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Colors, Fonts } from '../constants/colors'

interface HiddenGemBadgeProps {
  discovered: number
  total: number
}

export function HiddenGemBadge({ discovered, total }: HiddenGemBadgeProps) {
  if (total === 0) return null

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💎</Text>
      <Text style={styles.text}>
        {discovered}/{total} Gems
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212,168,83,0.15)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.30)',
    alignSelf: 'center',
  },
  icon: {
    fontSize: 14,
  },
  text: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.accent,
  },
})
