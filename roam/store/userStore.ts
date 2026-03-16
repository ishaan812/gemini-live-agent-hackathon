import { create } from 'zustand'

export type NarrationStyle = 'historical' | 'funny' | 'poetic' | 'adventurous'
export type Language = 'en' | 'hi' | 'es' | 'fr' | 'ar' | 'pt' | 'ja' | 'de'

export interface Guide {
  id: NarrationStyle
  name: string
  avatar: string
  color: string
  colorDim: string
  desc: string
  fullDesc: string
}

export const GUIDES: Guide[] = [
  {
    id: 'historical',
    name: 'Professor Arjun',
    avatar: '🧒🏽',
    color: '#6EC6FF',
    colorDim: 'rgba(110,198,255,0.15)',
    desc: 'A wise scholar who brings history alive with fascinating facts and dates',
    fullDesc: 'Professor Arjun has spent years poring over dusty archives and ancient manuscripts. He knows the exact year every building was erected, which governor signed which decree, and the stories behind every street name. With him by your side, every stop becomes a living history lesson — rich with dates, lesser-known facts, and the kind of scholarly detail that makes you see the city through entirely new eyes. Perfect for the curious mind that loves depth and authenticity.',
  },
  {
    id: 'funny',
    name: 'Mischief Maya',
    avatar: '👧🏻',
    color: '#FF8A80',
    colorDim: 'rgba(255,138,128,0.15)',
    desc: 'Sarcastic, hilarious, and never misses a chance to crack you up',
    fullDesc: "Maya treats every tour like a stand-up set. She'll roast centuries-old architecture, give British colonizers snarky nicknames, and find the absurd angle in every historical event. Her narrations are packed with witty one-liners, playful sarcasm, and the kind of irreverent humor that makes you laugh out loud in public. If you want to learn history while snort-laughing at your phone, Maya's your guide.",
  },
  {
    id: 'poetic',
    name: 'Dreamy Luna',
    avatar: '🧑🏾',
    color: '#CE93D8',
    colorDim: 'rgba(206,147,216,0.15)',
    desc: 'A gentle soul who paints every scene with lyrical, vivid imagery',
    fullDesc: "Luna sees the world through a painter's eye. Every crumbling facade becomes a meditation on time, every ocean breeze carries whispered memories of sailors long gone. Her narrations are lyrical and immersive — full of vivid imagery, sensory details, and the kind of quiet beauty that makes you pause and really look at what's in front of you. Choose Luna when you want your tour to feel like wandering through a poem.",
  },
  {
    id: 'adventurous',
    name: 'Captain Rex',
    avatar: '👦🏼',
    color: '#FFD54F',
    colorDim: 'rgba(255,213,79,0.15)',
    desc: 'Bold, dramatic, and turns every stop into an epic adventure',
    fullDesc: "Captain Rex doesn't do boring. Every stop is a quest, every alley hides a mystery, and every landmark has a legendary origin story that he tells with maximum dramatic flair. His narrations are high-energy, full of suspense and excitement — think of him as the action-movie narrator of tour guides. If you want your walk through the city to feel like an epic adventure, Rex will make it happen.",
  },
]

export const NARRATION_STYLES = GUIDES.map((g) => ({
  value: g.id,
  label: g.name,
  desc: g.desc,
}))

export const LANGUAGES: { value: Language; label: string; native: string }[] = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { value: 'es', label: 'Spanish', native: 'Español' },
  { value: 'fr', label: 'French', native: 'Français' },
  { value: 'ar', label: 'Arabic', native: 'العربية' },
  { value: 'pt', label: 'Portuguese', native: 'Português' },
  { value: 'ja', label: 'Japanese', native: '日本語' },
  { value: 'de', label: 'German', native: 'Deutsch' },
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
