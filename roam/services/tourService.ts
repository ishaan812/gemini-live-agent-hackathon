import { COLABA_TOUR, COLABA_STOPS } from '../constants/config'
import { Tour } from '../types/tour'
import { Stop } from '../types/stop'

export function fetchTourStops(): Stop[] {
  return COLABA_STOPS.map((stop) => ({
    ...stop,
    order: stop.order,
  }))
}

export function fetchTour(): Tour {
  return COLABA_TOUR
}

export function getStopById(stopId: string): Stop | undefined {
  return COLABA_STOPS.find((stop) => stop.id === stopId)
}
