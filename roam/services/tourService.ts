import { COLABA_TOUR, COLABA_STOPS, ALL_TOURS, getTourById } from '../constants/config'
import { Tour } from '../types/tour'
import { Stop } from '../types/stop'

export function fetchTourStops(tourId?: string): Stop[] {
  if (tourId) {
    const tour = getTourById(tourId)
    if (tour) return tour.stops.map((stop) => ({ ...stop }))
  }
  return COLABA_STOPS.map((stop) => ({ ...stop }))
}

export function fetchTour(tourId?: string): Tour {
  if (tourId) {
    const tour = getTourById(tourId)
    if (tour) return tour as Tour
  }
  return COLABA_TOUR as Tour
}

export function getStopById(stopId: string): Stop | undefined {
  for (const tour of ALL_TOURS) {
    const stop = tour.stops.find((s) => s.id === stopId)
    if (stop) return stop
  }
  return undefined
}
