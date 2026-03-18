import { HiddenGem } from '../types/hiddenGem'

export const COLABA_HIDDEN_GEMS: HiddenGem[] = [
  // Gateway of India
  {
    id: 'gateway-shivaji-statue',
    stopId: 'gateway-of-india',
    name: 'Chhatrapati Shivaji Maharaj Statue',
    description: 'This grand equestrian bronze statue of the Maratha warrior king was installed in 1961. Shivaji founded the Maratha Empire in the 17th century.',
    hint: 'Look for the warrior king on horseback near the waterfront',
    visualCues: ['equestrian statue', 'horse statue', 'bronze statue on horseback', 'Shivaji statue'],
    latitude: 18.9225,
    longitude: 72.8340,
  },
  {
    id: 'gateway-stone-elephants',
    stopId: 'gateway-of-india',
    name: 'Stone Elephants of the Gateway',
    description: 'The Gateway arch features intricate stone elephant carvings inspired by the Gwalior Fort style, added during the original construction (1911-1924).',
    hint: 'Look closely at the archway itself for some majestic animal carvings',
    visualCues: ['stone elephants', 'elephant carvings', 'carved elephants on arch', 'gateway arch details'],
    latitude: 18.9219,
    longitude: 72.8347,
  },
  // Taj Mahal Palace Hotel
  {
    id: 'taj-iconic-dome',
    stopId: 'taj-mahal-palace',
    name: 'The Taj Dome & Turrets',
    description: 'The iconic red Mangalore-tiled dome was inspired by the Florentine Renaissance. The hotel was built because founder Jamsetji Tata was allegedly denied entry to a European hotel.',
    hint: 'Look up at the most iconic part of the hotel skyline',
    visualCues: ['dome', 'red dome', 'hotel dome', 'turrets', 'Taj dome'],
    latitude: 18.9220,
    longitude: 72.8330,
  },
  {
    id: 'taj-sea-lounge-wing',
    stopId: 'taj-mahal-palace',
    name: 'The Sea Lounge Wing',
    description: 'The sea-facing wing houses the legendary Sea Lounge, a favourite of Mumbai\'s elite since 1903. During WWII, the Taj served as a hospital for British soldiers.',
    hint: 'Find the elegant wing that faces the Arabian Sea',
    visualCues: ['sea facing wing', 'sea lounge', 'waterfront wing', 'hotel wing facing sea'],
    latitude: 18.9215,
    longitude: 72.8338,
  },
  // Regal Cinema
  {
    id: 'regal-art-deco-facade',
    stopId: 'regal-cinema',
    name: 'Art Deco Facade Details',
    description: 'Mumbai has the world\'s second largest collection of Art Deco buildings after Miami, and Regal was one of the first to showcase this style in India.',
    hint: 'Study the geometric patterns and ornamental details on the cinema\'s exterior',
    visualCues: ['art deco facade', 'geometric patterns', 'cinema exterior', 'art deco building'],
    latitude: 18.9270,
    longitude: 72.8312,
  },
  {
    id: 'regal-causeway-art',
    stopId: 'regal-cinema',
    name: 'Colaba Causeway Street Scene',
    description: 'The bustling Colaba Causeway stretching from Regal Cinema is one of Mumbai\'s most iconic street shopping destinations, dating back to the 1800s.',
    hint: 'Look down the famous shopping street stretching away from the cinema',
    visualCues: ['Colaba Causeway', 'street market', 'busy street', 'shopping street'],
    latitude: 18.9265,
    longitude: 72.8308,
  },
  // Kala Ghoda
  {
    id: 'kala-ghoda-black-horse',
    stopId: 'kala-ghoda',
    name: 'The Black Horse Statue',
    description: 'Kala Ghoda means "Black Horse" — named after a statue of King Edward VII that once stood here. A new abstract black horse sculpture was installed in 2017.',
    hint: 'Find the statue that gave this entire district its name',
    visualCues: ['black horse', 'horse statue', 'Kala Ghoda statue', 'horse sculpture'],
    latitude: 18.9290,
    longitude: 72.8320,
  },
  {
    id: 'kala-ghoda-sassoon-library',
    stopId: 'kala-ghoda',
    name: 'David Sassoon Library',
    description: 'This Venetian Gothic building was built in 1870 by David Sassoon, a Baghdadi Jewish philanthropist. The clock tower is one of Kala Ghoda\'s most recognizable features.',
    hint: 'Spot the striking Venetian Gothic building with a clock tower',
    visualCues: ['Sassoon Library', 'Venetian Gothic building', 'clock tower', 'library building'],
    latitude: 18.9285,
    longitude: 72.8315,
  },
  {
    id: 'kala-ghoda-street-art',
    stopId: 'kala-ghoda',
    name: 'Kala Ghoda Street Art Murals',
    description: 'During the annual Kala Ghoda Arts Festival, artists create vibrant murals. Many remain year-round, making this Mumbai\'s unofficial outdoor art gallery.',
    hint: 'Look for colourful walls that tell stories without words',
    visualCues: ['street art', 'mural', 'wall art', 'graffiti art', 'painted wall'],
    latitude: 18.9292,
    longitude: 72.8322,
  },
  // Asiatic Library
  {
    id: 'asiatic-grand-columns',
    stopId: 'asiatic-library',
    name: 'The Neoclassical Columns',
    description: 'The Asiatic Society Library features grand Doric columns inspired by the Temple of Athena. Built in 1833, it houses over 100,000 books including rare manuscripts.',
    hint: 'Count the imposing columns that guard the entrance',
    visualCues: ['columns', 'Doric columns', 'neoclassical columns', 'library entrance', 'grand pillars'],
    latitude: 18.9326,
    longitude: 72.8340,
  },
  {
    id: 'asiatic-horniman-circle',
    stopId: 'asiatic-library',
    name: 'Horniman Circle Garden',
    description: 'This circular garden is surrounded by Victorian-era buildings. Renamed after Benjamin Horniman, a British editor who supported Indian independence.',
    hint: 'Find the peaceful circular garden hidden behind grand buildings',
    visualCues: ['circular garden', 'Horniman Circle', 'park', 'round garden'],
    latitude: 18.9320,
    longitude: 72.8335,
  },
]

export const getHiddenGemsForStop = (stopId: string): HiddenGem[] =>
  COLABA_HIDDEN_GEMS.filter((gem) => gem.stopId === stopId)

export const Config = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
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
  duration: '~1 hr',
  image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800',
  about: 'Walk through the historic Colaba district, from the majestic Gateway of India to the cultural heart of Kala Ghoda. Experience colonial-era architecture, bustling markets, and hidden gems along the way. Each stop is verified with AI-powered landmark recognition and narrated by your personal guide.',
  stops: COLABA_STOPS,
}

// Dharavi Art Walk
export const DHARAVI_STOPS = [
  {
    id: 'dharavi-entrance',
    name: 'Dharavi Junction',
    description: 'The main entrance to one of Asia\'s most vibrant neighborhoods, home to a thriving informal economy and artistic community.',
    latitude: 19.0438,
    longitude: 72.8534,
    order: 0,
    historicalImages: [
      'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800',
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800',
    ],
  },
  {
    id: 'pottery-colony',
    name: 'Kumbharwada Pottery Colony',
    description: 'A centuries-old potters\' quarter where artisans shape clay using techniques passed down through generations. Watch them craft everything from diyas to decorative pieces.',
    latitude: 19.0445,
    longitude: 72.8528,
    order: 1,
    historicalImages: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
    ],
  },
  {
    id: 'leather-workshop',
    name: 'Leather Artisan Workshop',
    description: 'Skilled craftspeople produce high-quality leather goods exported worldwide. See the intricate process from tanning to finished bags, belts, and wallets.',
    latitude: 19.0451,
    longitude: 72.8521,
    order: 2,
    historicalImages: [
      'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=800',
      'https://images.unsplash.com/photo-1531425300484-d1045bce3b4c?w=800',
    ],
  },
  {
    id: 'recycling-district',
    name: 'Recycling Innovation Hub',
    description: 'Dharavi recycles 80% of Mumbai\'s plastic waste. Witness the incredible resourcefulness as materials are sorted, processed, and transformed into new products.',
    latitude: 19.0460,
    longitude: 72.8515,
    order: 3,
    historicalImages: [
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
      'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800',
    ],
  },
  {
    id: 'mural-street',
    name: 'Street Art Murals',
    description: 'Colorful murals painted by local and international artists transform narrow lanes into open-air galleries, telling stories of community resilience and hope.',
    latitude: 19.0468,
    longitude: 72.8509,
    order: 4,
    historicalImages: [
      'https://images.unsplash.com/photo-1561059488-916d69792237?w=800',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
    ],
  },
  {
    id: 'textile-lane',
    name: 'Textile Embroidery Lane',
    description: 'Rows of workshops where artisans create exquisite embroidery, sequin work, and textile prints used by major fashion brands around the world.',
    latitude: 19.0475,
    longitude: 72.8502,
    order: 5,
    historicalImages: [
      'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
      'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=800',
    ],
  },
]

export const DHARAVI_TOUR = {
  id: 'dharavi-art-walk',
  name: 'Dharavi Art Walk',
  description: 'Discover the creativity and craftsmanship of Dharavi',
  distance: '2.1 km',
  duration: '~2 hrs',
  image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800',
  about: 'Explore the artistic soul of Dharavi — one of the world\'s most dynamic neighborhoods. From ancient pottery traditions to cutting-edge street art, this walk reveals the incredible creativity, entrepreneurship, and resilience of Dharavi\'s artisan communities. A portion of tour proceeds supports local artists.',
  stops: DHARAVI_STOPS,
}

// Mumbai Street Eats
export const STREET_EATS_STOPS = [
  {
    id: 'mohammad-ali-road',
    name: 'Mohammad Ali Road',
    description: 'The beating heart of Mumbai street food. Famous for its kebabs, malpuas, and the legendary Noor Mohammadi nihari — a slow-cooked stew that\'s been perfected over decades.',
    latitude: 18.9596,
    longitude: 72.8337,
    order: 0,
    historicalImages: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
      'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=800',
    ],
  },
  {
    id: 'khau-galli',
    name: 'Khau Galli (Food Lane)',
    description: 'A narrow lane packed with vendors serving everything from spicy pav bhaji to sweet mango lassi. Each stall has its own loyal following built over generations.',
    latitude: 18.9582,
    longitude: 72.8321,
    order: 1,
    historicalImages: [
      'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800',
      'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=800',
    ],
  },
  {
    id: 'bhaji-pav-corner',
    name: 'Cannon Pav Bhaji',
    description: 'The iconic pav bhaji stall near Chhatrapati Shivaji Terminus. Butter-laden, spiced vegetable mash served with toasted bread — a Mumbai institution since the 1950s.',
    latitude: 18.9568,
    longitude: 72.8350,
    order: 2,
    historicalImages: [
      'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=800',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800',
    ],
  },
  {
    id: 'chaat-stalls',
    name: 'Girgaum Chowpatty Chaat',
    description: 'The legendary beach chaat stalls serving crispy bhel puri, tangy sev puri, and the famous ragda pattice. Best enjoyed as the sun sets over the Arabian Sea.',
    latitude: 18.9542,
    longitude: 72.8145,
    order: 3,
    historicalImages: [
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800',
      'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800',
    ],
  },
  {
    id: 'vada-pav-original',
    name: 'Ashok Vada Pav',
    description: 'The original vada pav — Mumbai\'s answer to the burger. A spiced potato fritter in a bun with fiery chutneys. This tiny stall near Kirti College has been the gold standard since 1966.',
    latitude: 18.9785,
    longitude: 72.8389,
    order: 4,
    historicalImages: [
      'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=800',
      'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800',
    ],
  },
  {
    id: 'kulfi-falooda',
    name: 'Haji Ali Juice Centre',
    description: 'A landmark juice and dessert shop near the Haji Ali Dargah. Famous for its fresh fruit juices, creamy kulfi falooda, and the stunning sea-facing location.',
    latitude: 18.9827,
    longitude: 72.8128,
    order: 5,
    historicalImages: [
      'https://images.unsplash.com/photo-1571006835697-244adcf15329?w=800',
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800',
    ],
  },
  {
    id: 'irani-cafe',
    name: 'Kyani & Co. Irani Cafe',
    description: 'Step back in time at this century-old Irani cafe. Sip bun maska with chai, surrounded by vintage tile work and creaky ceiling fans — a taste of old Bombay that refuses to fade.',
    latitude: 18.9438,
    longitude: 72.8278,
    order: 6,
    historicalImages: [
      'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800',
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
    ],
  },
  {
    id: 'crawford-market-spices',
    name: 'Crawford Market Spice Bazaar',
    description: 'End your food journey at this heritage market built in 1869. Wander through mountains of colorful spices, dried fruits, and exotic ingredients — the secret behind Mumbai\'s incredible flavors.',
    latitude: 18.9474,
    longitude: 72.8344,
    order: 7,
    historicalImages: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
      'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800',
    ],
  },
]

export const STREET_EATS_TOUR = {
  id: 'mumbai-street-eats',
  name: 'Mumbai Street Eats',
  description: 'A culinary adventure through Mumbai\'s legendary street food scene',
  distance: '1.2 km',
  duration: '~2.5 hrs',
  image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
  about: 'Taste your way through Mumbai\'s most iconic street food spots — from sizzling kebab lanes to century-old Irani cafes. This tour covers eight unforgettable stops across the city\'s most flavorful neighborhoods. Come hungry, leave with stories. Vegetarian alternatives available at every stop.',
  stops: STREET_EATS_STOPS,
}

// All tours lookup
export const ALL_TOURS = [COLABA_TOUR, DHARAVI_TOUR, STREET_EATS_TOUR]

export function getTourById(id: string) {
  return ALL_TOURS.find((tour) => tour.id === id)
}
