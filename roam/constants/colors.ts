export const Colors = {
  // Core backgrounds
  primary: '#0B1A2B',
  primaryLight: '#122236',
  background: '#0D1B2A',

  // Glassmorphic surfaces
  glass: 'rgba(255,255,255,0.10)',
  glassBorder: 'rgba(255,255,255,0.18)',
  glassLight: 'rgba(255,255,255,0.06)',
  glassMedium: 'rgba(255,255,255,0.14)',
  glassHeavy: 'rgba(255,255,255,0.20)',

  // Legacy surface aliases (used by assistant page)
  surface: 'rgba(255,255,255,0.08)',
  surfaceLight: 'rgba(255,255,255,0.12)',
  card: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.15)',
  lightGray: 'rgba(255,255,255,0.08)',

  // Accent
  accent: '#D4A853',
  accentDim: 'rgba(212,168,83,0.15)',
  accentSoft: 'rgba(212,168,83,0.25)',

  // Text
  white: '#FFFFFF',
  text: 'rgba(255,255,255,0.92)',
  textSecondary: 'rgba(255,255,255,0.60)',
  textMuted: 'rgba(255,255,255,0.40)',
  gray: 'rgba(255,255,255,0.45)',

  // Status
  success: '#4ADE80',
  error: '#F87171',

  // Gradient stops
  gradientStart: '#0F2027',
  gradientMid: '#203A43',
  gradientEnd: '#2C5364',
} as const

export const Fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extraBold: 'Poppins_800ExtraBold',
} as const

// Glass card style helper (use spread in StyleSheet)
export const GlassCard = {
  backgroundColor: 'rgba(255,255,255,0.10)',
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.18)',
} as const
