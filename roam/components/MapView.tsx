import React from 'react'
import { StyleSheet } from 'react-native'
import RNMapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps'
import { Stop } from '../types/stop'
import { Colors } from '../constants/colors'

interface Props {
  stops: Stop[]
  currentStopIndex: number
  completedStops: string[]
  userLatitude: number
  userLongitude: number
}

function TourMapViewInner({
  stops,
  currentStopIndex,
  completedStops,
  userLatitude,
  userLongitude,
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
    </RNMapView>
  )
}

export const TourMapView = React.memo(TourMapViewInner)

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
})
