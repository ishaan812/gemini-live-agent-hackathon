// Haversine formula to calculate distance between two GPS coordinates
export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function isWithinThreshold(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  thresholdMeters: number = 50,
): boolean {
  return getDistanceMeters(lat1, lon1, lat2, lon2) <= thresholdMeters
}
