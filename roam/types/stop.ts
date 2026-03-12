export interface Stop {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  narration?: string
  imageUrl?: string
  order: number
  historicalImages?: string[]
}

export interface VerificationResult {
  verified: boolean
  confidence: number
}

export interface NarrationResult {
  text: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
