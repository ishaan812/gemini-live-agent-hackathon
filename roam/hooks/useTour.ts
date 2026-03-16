import { useEffect, useRef } from 'react'
import { useTourStore } from '../store/tourStore'
import { fetchTour } from '../services/tourService'
import { Stop } from '../types/stop'

export function useTour() {
  const { stops, tourId, tourMeta, currentStopIndex, completedStops, setTour, setStops, nextStop, goToStop, completeCurrentStop, resetTour } =
    useTourStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current && stops.length === 0) {
      initialized.current = true
      const tour = fetchTour()
      setTour(
        { id: tour.id, name: tour.name, description: tour.description, distance: tour.distance },
        tour.stops,
      )
    }
  }, [stops.length, setTour])

  const currentStop: Stop | null = stops[currentStopIndex] ?? null
  const isComplete = completedStops.length === stops.length && stops.length > 0
  const progress = stops.length > 0 ? completedStops.length / stops.length : 0

  return {
    stops,
    tourId,
    tourMeta,
    currentStop,
    currentStopIndex,
    completedStops,
    isComplete,
    progress,
    nextStop,
    goToStop,
    completeCurrentStop,
    resetTour,
    setTour,
  }
}
