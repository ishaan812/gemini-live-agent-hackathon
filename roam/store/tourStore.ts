import { create } from 'zustand'
import { Stop } from '../types/stop'

interface TourState {
  tourId: string | null
  stops: Stop[]
  currentStopIndex: number
  completedStops: string[]
  setStops: (stops: Stop[]) => void
  nextStop: () => void
  goToStop: (index: number) => void
  completeCurrentStop: () => void
  resetTour: () => void
  isComplete: () => boolean
}

export const useTourStore = create<TourState>((set, get) => ({
  tourId: null,
  stops: [],
  currentStopIndex: 0,
  completedStops: [],

  setStops: (stops) => set({ stops, currentStopIndex: 0, completedStops: [] }),

  nextStop: () => {
    const { currentStopIndex, stops } = get()
    if (currentStopIndex < stops.length - 1) {
      set({ currentStopIndex: currentStopIndex + 1 })
    }
  },

  goToStop: (index) => {
    const { stops } = get()
    if (index >= 0 && index < stops.length) {
      set({ currentStopIndex: index })
    }
  },

  completeCurrentStop: () => {
    const { stops, currentStopIndex, completedStops } = get()
    const currentStop = stops[currentStopIndex]
    if (currentStop && !completedStops.includes(currentStop.id)) {
      set({ completedStops: [...completedStops, currentStop.id] })
    }
  },

  resetTour: () => set({ tourId: null, stops: [], currentStopIndex: 0, completedStops: [] }),

  isComplete: () => {
    const { stops, completedStops } = get()
    return stops.length > 0 && completedStops.length === stops.length
  },
}))
