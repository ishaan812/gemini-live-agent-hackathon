import { useMemo } from 'react'
import { useHiddenGemStore } from '../store/hiddenGemStore'
import { getHiddenGemsForStop, COLABA_HIDDEN_GEMS } from '../constants/config'

export function useHiddenGems(stopId?: string) {
  const { discoveries, addDiscovery, totalDiscovered, totalGems } = useHiddenGemStore()

  const gemsForStop = useMemo(
    () => (stopId ? getHiddenGemsForStop(stopId) : []),
    [stopId]
  )

  const discoveredForStop = useMemo(
    () =>
      gemsForStop.filter((gem) => discoveries[gem.id] !== undefined),
    [gemsForStop, discoveries]
  )

  const undiscoveredForStop = useMemo(
    () =>
      gemsForStop.filter((gem) => discoveries[gem.id] === undefined),
    [gemsForStop, discoveries]
  )

  return {
    gemsForStop,
    discoveredForStop,
    undiscoveredForStop,
    discoveredCountForStop: discoveredForStop.length,
    totalCountForStop: gemsForStop.length,
    totalDiscovered: totalDiscovered(),
    totalGems: totalGems(),
    allGems: COLABA_HIDDEN_GEMS,
    addDiscovery,
  }
}
