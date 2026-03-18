import { create } from 'zustand'
import { HiddenGemDiscovery } from '../types/hiddenGem'
import { COLABA_HIDDEN_GEMS } from '../constants/config'

interface HiddenGemState {
  discoveries: Record<string, HiddenGemDiscovery>
  addDiscovery: (gemId: string, stopId: string) => void
  getDiscoveriesForStop: (stopId: string) => HiddenGemDiscovery[]
  totalDiscovered: () => number
  totalGems: () => number
  resetDiscoveries: () => void
}

export const useHiddenGemStore = create<HiddenGemState>((set, get) => ({
  discoveries: {},

  addDiscovery: (gemId, stopId) => {
    const { discoveries } = get()
    if (discoveries[gemId]) return
    set({
      discoveries: {
        ...discoveries,
        [gemId]: {
          gemId,
          stopId,
          discoveredAt: new Date().toISOString(),
        },
      },
    })
  },

  getDiscoveriesForStop: (stopId) => {
    const { discoveries } = get()
    return Object.values(discoveries).filter((d) => d.stopId === stopId)
  },

  totalDiscovered: () => Object.keys(get().discoveries).length,

  totalGems: () => COLABA_HIDDEN_GEMS.length,

  resetDiscoveries: () => set({ discoveries: {} }),
}))
