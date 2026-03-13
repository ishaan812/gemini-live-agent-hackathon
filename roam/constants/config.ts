export const Config = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  SERVER_URL: process.env.EXPO_PUBLIC_SERVER_URL || 'http://192.168.1.155:3001',
  GEMINI_API_KEY: 'AQ.Ab8RN6KW7-39bkfbrgOP8YLu-T6ni6XZV94xxenmVhDIKONChg',
  ARRIVAL_THRESHOLD_METERS: 50,
  DEFAULT_TOUR_ID: 'colaba-heritage-walk',
} as const

// Mock stops for Colaba Heritage Walk
export const COLABA_STOPS = [
  {
    id: 'gateway-of-india',
    name: 'Gateway of India',
    description: 'The iconic arch monument overlooking the Arabian Sea, built to commemorate the visit of King George V.',
    latitude: 18.9220,
    longitude: 72.8347,
    order: 0,
    historicalImages: [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800',
      'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
    ],
  },
  {
    id: 'taj-mahal-palace',
    name: 'Taj Mahal Palace Hotel',
    description: 'A grand luxury hotel that has been a symbol of Mumbai since 1903.',
    latitude: 18.9217,
    longitude: 72.8332,
    order: 1,
    historicalImages: [
      'https://images.unsplash.com/photo-1585607344893-ae7cb8497801?w=800',
      'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800',
    ],
  },
  {
    id: 'regal-cinema',
    name: 'Regal Cinema',
    description: 'One of the oldest cinemas in Mumbai, an Art Deco landmark from 1933.',
    latitude: 18.9268,
    longitude: 72.8311,
    order: 2,
    historicalImages: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800',
    ],
  },
  {
    id: 'kala-ghoda',
    name: 'Kala Ghoda',
    description: 'The art district of Mumbai, known for its galleries, boutiques, and annual festival.',
    latitude: 18.9288,
    longitude: 72.8318,
    order: 3,
    historicalImages: [
      'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800',
      'https://images.unsplash.com/photo-1595422656414-b2a97d0ed2d9?w=800',
    ],
  },
  {
    id: 'asiatic-library',
    name: 'Asiatic Library',
    description: 'A neoclassical building housing one of the oldest libraries in Mumbai, established in 1804.',
    latitude: 18.9325,
    longitude: 72.8338,
    order: 4,
    historicalImages: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
      'https://images.unsplash.com/photo-1599420186946-7f269e8c789c?w=800',
    ],
  },
]

export const COLABA_TOUR = {
  id: 'colaba-heritage-walk',
  name: 'Colaba Heritage Walk',
  description: 'Explore the historic Colaba district of Mumbai',
  distance: '1.8 km',
  stops: COLABA_STOPS,
}
