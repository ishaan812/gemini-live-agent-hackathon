import { getDistanceMeters, isWithinThreshold } from '../utils/distance'

describe('distance utility', () => {
  // Gateway of India to Taj Mahal Palace Hotel (~170m apart)
  const gatewayLat = 18.922
  const gatewayLon = 72.8347
  const tajLat = 18.9217
  const tajLon = 72.8332

  it('should calculate distance between two points', () => {
    const distance = getDistanceMeters(gatewayLat, gatewayLon, tajLat, tajLon)
    expect(distance).toBeGreaterThan(100)
    expect(distance).toBeLessThan(300)
  })

  it('should return 0 for same point', () => {
    const distance = getDistanceMeters(
      gatewayLat,
      gatewayLon,
      gatewayLat,
      gatewayLon,
    )
    expect(distance).toBe(0)
  })

  it('should detect when within threshold', () => {
    // Same point should be within 50m
    expect(
      isWithinThreshold(gatewayLat, gatewayLon, gatewayLat, gatewayLon, 50),
    ).toBe(true)
  })

  it('should detect when outside threshold', () => {
    // Gateway to Taj are ~170m apart, should not be within 50m
    expect(
      isWithinThreshold(gatewayLat, gatewayLon, tajLat, tajLon, 50),
    ).toBe(false)
  })

  it('should use default threshold of 50m', () => {
    expect(
      isWithinThreshold(gatewayLat, gatewayLon, gatewayLat, gatewayLon),
    ).toBe(true)
  })
})
