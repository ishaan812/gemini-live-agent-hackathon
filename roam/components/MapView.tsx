import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import RNMapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps'
import { Stop } from '../types/stop'
import { HiddenGem } from '../types/hiddenGem'
import { Colors } from '../constants/colors'

interface Props {
  stops: Stop[]
  currentStopIndex: number
  completedStops: string[]
  userLatitude: number
  userLongitude: number
  hiddenGems?: HiddenGem[]
  discoveredGemIds?: string[]
}

function TourMapViewInner({
  stops,
  currentStopIndex,
  completedStops,
  userLatitude,
  userLongitude,
  hiddenGems = [],
  discoveredGemIds = [],
}: Props) {
  const currentStop = stops[currentStopIndex]

  // Route from user -> current stop -> remaining stops
  const routeCoords = [
    { latitude: userLatitude, longitude: userLongitude },
    ...stops
      .filter((_, i) => i >= currentStopIndex)
      .map((s) => ({ latitude: s.latitude, longitude: s.longitude })),
  ]

  return (
    <RNMapView
      provider={PROVIDER_DEFAULT}
      style={styles.map}
      initialRegion={{
        latitude: currentStop?.latitude ?? userLatitude,
        longitude: currentStop?.longitude ?? userLongitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation
      showsMyLocationButton
    >
      {/* Dashed route line */}
      <Polyline
        coordinates={routeCoords}
        strokeColor={Colors.accent}
        strokeWidth={3}
        lineDashPattern={[6, 4]}
      />

      {stops.map((stop, index) => {
        const isCompleted = completedStops.includes(stop.id)
        const isCurrent = index === currentStopIndex

        return (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: stop.latitude,
              longitude: stop.longitude,
            }}
            title={`${index + 1}. ${stop.name}`}
            description={stop.description}
            pinColor={
              isCompleted
                ? Colors.success
                : isCurrent
                  ? Colors.accent
                  : Colors.gray
            }
          />
        )
      })}

      {/* Hidden gem markers — diamond-shaped custom views */}
      {hiddenGems.map((gem) => {
        const isDiscovered = discoveredGemIds.includes(gem.id)
        return (
          <Marker
            key={gem.id}
            coordinate={{
              latitude: gem.latitude,
              longitude: gem.longitude,
            }}
            title={isDiscovered ? gem.name : '?'}
            description={isDiscovered ? gem.description : 'Hidden Gem — discover it with your guide!'}
          >
            <View style={[
              styles.gemMarker,
              isDiscovered ? styles.gemMarkerFound : styles.gemMarkerHidden,
            ]}>
              <Text style={styles.gemMarkerText}>
                {isDiscovered ? '💎' : '?'}
              </Text>
            </View>
          </Marker>
        )
      })}
    </RNMapView>
  )
}

export const TourMapView = React.memo(TourMapViewInner)

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  gemMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  gemMarkerHidden: {
    backgroundColor: 'rgba(107,114,128,0.7)',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  gemMarkerFound: {
    backgroundColor: 'rgba(168,85,247,0.85)',
    borderColor: '#D4A853',
  },
  gemMarkerText: {
    fontSize: 14,
    transform: [{ rotate: '-45deg' }],
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
})
