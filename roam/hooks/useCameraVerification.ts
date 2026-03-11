import { useState } from 'react'
import { verifyLandmark } from '../services/geminiService'
import { Stop } from '../types/stop'

interface VerificationState {
  verifying: boolean
  verified: boolean | null
  confidence: number
  error: string | null
}

export function useCameraVerification() {
  const [state, setState] = useState<VerificationState>({
    verifying: false,
    verified: null,
    confidence: 0,
    error: null,
  })

  async function verify(imageBase64: string, stop: Stop) {
    setState({ verifying: true, verified: null, confidence: 0, error: null })

    try {
      const result = await verifyLandmark(imageBase64, stop)
      setState({
        verifying: false,
        verified: result.verified,
        confidence: result.confidence,
        error: null,
      })
      return result.verified
    } catch (error) {
      setState({
        verifying: false,
        verified: false,
        confidence: 0,
        error: 'Verification failed. Please try again.',
      })
      return false
    }
  }

  function reset() {
    setState({ verifying: false, verified: null, confidence: 0, error: null })
  }

  return { ...state, verify, reset }
}
