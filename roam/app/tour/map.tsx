import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { TourMapView } from '../../components/MapView'
import { StopCard } from '../../components/StopCard'
import { useLocation } from '../../hooks/useLocation'
import { useTour } from '../../hooks/useTour'
import { isWithinThreshold, getDistanceMeters } from '../../utils/distance'
import { Colors, Fonts } from '../../constants/colors'
import { Config } from '../../constants/config'
import { useHiddenGems } from '../../hooks/useHiddenGems'
import { HiddenGemBadge } from '../../components/HiddenGemBadge'

export default function MapScreen() {
  const router = useRouter()
  const location = useLocation()
  const { stops, currentStop, currentStopIndex, completedStops } = useTour()
  const { discoveredCountForStop, totalCountForStop, gemsForStop, discoveredForStop } = useHiddenGems(currentStop?.id)

  const isNearStop =
    currentStop && !location.loading
      ? isWithinThreshold(
          location.latitude,
          location.longitude,
          currentStop.latitude,
          currentStop.longitude,
          Config.ARRIVAL_THRESHOLD_METERS,
        )
      : false

  const distanceToStop =
    currentStop && !location.loading
      ? Math.round(
          getDistanceMeters(
            location.latitude,
            location.longitude,
            currentStop.latitude,
            currentStop.longitude,
          ),
        )
      : null

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {!location.loading && (
          <TourMapView
            stops={stops}
            currentStopIndex={currentStopIndex}
            completedStops={completedStops}
            userLatitude={location.latitude}
            userLongitude={location.longitude}
            hiddenGems={gemsForStop}
            discoveredGemIds={discoveredForStop.map((g) => g.id)}
          />
        )}
        {location.loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        )}
      </View>

      {/* Top bar */}
      <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.topRow} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.pillButton}
            onPress={() => router.back()}
          >
            <Text style={styles.pillButtonText}>‹ Back</Text>
          </TouchableOpacity>

          {!isNearStop && currentStop && (
            <TouchableOpacity
              style={styles.pillButton}
              onPress={() => router.push('/tour/camera')}
            >
              <Text style={styles.pillButtonText}>Skip ›</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <View style={styles.bottomSheet}>
        {currentStop && (
          <>
            <StopCard
              stop={currentStop}
              isActive={true}
              isCompleted={completedStops.includes(currentStop.id)}
              distance={
                distanceToStop !== null ? `${distanceToStop}m away` : undefined
              }
            />
            <HiddenGemBadge discovered={discoveredCountForStop} total={totalCountForStop} />
            {isNearStop && (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => router.push('/tour/camera')}
              >
                <Text style={styles.verifyButtonText}>Verify Checkpoint</Text>
              </TouchableOpacity>
            )}
            {!isNearStop && distanceToStop !== null && (
              <Text style={styles.walkText}>
                Walk to {currentStop.name} to continue
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },

  // Top bar
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pillButton: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pillButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },

  // Bottom sheet
  bottomSheet: {
    backgroundColor: 'rgba(15,32,39,0.92)',
    paddingVertical: 16,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  verifyButton: {
    backgroundColor: Colors.text,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 8,
  },
  verifyButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  walkText: {
    textAlign: 'center',
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    paddingBottom: 8,
  },
})
