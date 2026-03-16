import { Stop } from './stop'

export interface Tour {
  id: string
  name: string
  description: string
  distance: string
  duration?: string
  image?: string
  about?: string
  stops: Stop[]
}

export interface TourProgress {
  tourId: string
  completedStopIds: string[]
  currentStopIndex: number
  isComplete: boolean
}
