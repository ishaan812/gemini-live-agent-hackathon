import { useState, useEffect } from 'react'
import * as Location from 'expo-location'

interface LocationState {
  latitude: number
  longitude: number
  loading: boolean
  error: string | null
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: 0,
    longitude: 0,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null
    let isMounted = true

    async function startTracking() {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (!isMounted) return

      if (status !== 'granted') {
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: 'Location permission denied',
        }))
        return
      }

      // Get initial location
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      if (!isMounted) return

      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        loading: false,
        error: null,
      })

      // Watch for updates
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (newLocation) => {
          if (!isMounted) return
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            loading: false,
            error: null,
          })
        },
      )
    }

    startTracking()

    return () => {
      isMounted = false
      subscription?.remove()
    }
  }, [])

  return location
}
