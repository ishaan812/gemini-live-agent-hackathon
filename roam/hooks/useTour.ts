import { useEffect, useRef } from 'react'
import { useTourStore } from '../store/tourStore'
import { fetchTourStops } from '../services/tourService'
import { Stop } from '../types/stop'

export function useTour() {
  const { stops, currentStopIndex, completedStops, setStops, nextStop, goToStop, completeCurrentStop, resetTour } =
    useTourStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current && stops.length === 0) {
      initialized.current = true
      const tourStops = fetchTourStops()
      setStops(tourStops)
    }
  }, [stops.length, setStops])

  const currentStop: Stop | null = stops[currentStopIndex] ?? null
  const isComplete = completedStops.length === stops.length && stops.length > 0
  const progress = stops.length > 0 ? completedStops.length / stops.length : 0

  return {
    stops,
    currentStop,
    currentStopIndex,
    completedStops,
    isComplete,
    progress,
    nextStop,
    goToStop,
    completeCurrentStop,
    resetTour,
  }
}
