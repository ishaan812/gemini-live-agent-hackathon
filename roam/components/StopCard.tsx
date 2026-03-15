import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Stop } from '../types/stop'
import { Colors, Fonts } from '../constants/colors'

interface Props {
  stop: Stop
  isActive: boolean
  isCompleted: boolean
  distance?: string
}

export function StopCard({ stop, isActive, isCompleted, distance }: Props) {
  return (
    <View
      style={[
        styles.card,
        isActive && styles.activeCard,
        isCompleted && styles.completedCard,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.indicator,
            isCompleted && styles.completedIndicator,
            isActive && styles.activeIndicator,
          ]}
        />
        <Text style={[styles.name, isActive && styles.activeName]}>
          {stop.name}
        </Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {stop.description}
      </Text>
      {distance && <Text style={styles.distance}>{distance}</Text>}
      {isCompleted && <Text style={styles.badge}>Visited</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  activeCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  completedCard: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: 10,
  },
  activeIndicator: {
    backgroundColor: Colors.accent,
  },
  completedIndicator: {
    backgroundColor: Colors.success,
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
  activeName: {
    color: Colors.accent,
  },
  description: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginLeft: 20,
  },
  distance: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.accent,
    marginTop: 6,
    marginLeft: 20,
  },
  badge: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: Colors.success,
    marginTop: 4,
    marginLeft: 20,
  },
})
