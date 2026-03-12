import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useTour } from '../../hooks/useTour'
import { Colors, Fonts } from '../../constants/colors'
import { COLABA_TOUR } from '../../constants/config'

export default function TourOverviewScreen() {
  const router = useRouter()
  const { stops, completedStops, currentStopIndex, isComplete, goToStop } = useTour()

  const handleStopPress = (index: number) => {
    goToStop(index)
    router.push('/tour/map')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.tourName}>{COLABA_TOUR.name}</Text>
        <Text style={styles.tourMeta}>
          {COLABA_TOUR.distance} · {stops.length} stops · {completedStops.length} done
        </Text>

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
                {!isLast && (
                  <View
                    style={[
                      styles.connector,
                      isCompleted && styles.connectorCompleted,
                    ]}
                  />
                )}

                <View style={styles.dotRow}>
                  <View
                    style={[
                      styles.dot,
                      isCompleted && styles.dotCompleted,
                      isCurrent && !isCompleted && styles.dotCurrent,
                    ]}
                  >
                    {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                    {!isCompleted && (
                      <Text style={[styles.dotNumber, isCurrent && styles.dotNumberCurrent]}>
                        {index + 1}
                      </Text>
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
                    {isCompleted && (
                      <Text style={styles.visitedBadge}>Visited — tap to revisit</Text>
                    )}
                  </View>

                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/tour/map')}
        >
          <Text style={styles.startButtonText}>
            {isComplete
              ? 'View Tour Complete'
              : completedStops.length > 0
                ? 'Continue Tour'
                : 'Start Walking'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  tourName: {
    fontSize: 28,
    fontFamily: Fonts.extraBold,
    color: Colors.text,
    marginBottom: 4,
  },
  tourMeta: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    marginBottom: 8,
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    left: 17,
    top: 42,
    width: 2,
    height: 36,
    backgroundColor: Colors.border,
  },
  connectorCompleted: {
    backgroundColor: Colors.success,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
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
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.textSecondary,
  },
  dotNumberCurrent: {
    color: Colors.accent,
  },
  checkmark: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#fff',
  },
  stopInfo: {
    flex: 1,
    paddingVertical: 10,
  },
  stopName: {
    fontSize: 16,
    fontFamily: Fonts.bold,
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
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  visitedBadge: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.success,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: Colors.gray,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#000',
    fontSize: 17,
    fontFamily: Fonts.bold,
  },
})
