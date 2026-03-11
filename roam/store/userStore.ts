import { create } from 'zustand'

export type NarrationStyle = 'historical' | 'funny' | 'poetic' | 'adventurous'
export type Language = 'en' | 'hi' | 'mr' | 'gu'

export const NARRATION_STYLES: { value: NarrationStyle; label: string; desc: string }[] = [
  { value: 'historical', label: 'Historical', desc: 'Rich in dates, facts, and scholarly detail' },
  { value: 'funny', label: 'Funny & Sarcastic', desc: 'Witty commentary with a cheeky tone' },
  { value: 'poetic', label: 'Poetic', desc: 'Lyrical descriptions with vivid imagery' },
  { value: 'adventurous', label: 'Adventurous', desc: 'Exciting and dramatic storytelling' },
]

export const LANGUAGES: { value: Language; label: string; native: string }[] = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { value: 'mr', label: 'Marathi', native: 'मराठी' },
  { value: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
]

interface UserState {
  name: string
  narrationStyle: NarrationStyle
  language: Language
  completedTours: string[]
  onboarded: boolean
  setName: (name: string) => void
  setNarrationStyle: (style: NarrationStyle) => void
  setLanguage: (lang: Language) => void
  addCompletedTour: (tourId: string) => void
  setOnboarded: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  name: '',
  narrationStyle: 'historical',
  language: 'en',
  completedTours: [],
  onboarded: false,

  setName: (name) => set({ name }),
  setNarrationStyle: (narrationStyle) => set({ narrationStyle }),
  setLanguage: (language) => set({ language }),
  addCompletedTour: (tourId) => {
    const { completedTours } = get()
    if (!completedTours.includes(tourId)) {
      set({ completedTours: [...completedTours, tourId] })
    }
  },
  setOnboarded: () => set({ onboarded: true }),
}))
