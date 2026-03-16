export interface HiddenGem {
  id: string
  stopId: string
  name: string
  description: string
  hint: string
  visualCues: string[]
  latitude: number
  longitude: number
}

export interface HiddenGemDiscovery {
  gemId: string
  stopId: string
  discoveredAt: string
}
