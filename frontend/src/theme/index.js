// ============================================================
// THEME SYSTEM - Central Design Tokens
// Inspired by Duolingo / ELSA Speak / Coursera aesthetic
// ============================================================

export const COLORS = {
  // Brand
  primary: '#00D1A0',
  primaryDark: '#00A87E',
  primaryLight: '#E6F9F5',
  primaryBorder: '#A7F3D0',
  accent: '#005C42',

  // Surface
  background: '#F7F9FA',
  surface: '#FFFFFF',
  surfaceAlt: '#FAFAFA',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#10B981',
  successBg: '#D1FAE5',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  info: '#3B82F6',
  infoBg: '#DBEAFE',

  // Skills
  reading: '#3B82F6',
  readingBg: '#DBEAFE',
  listening: '#8B5CF6',
  listeningBg: '#EDE9FE',
  writing: '#F59E0B',
  writingBg: '#FEF3C7',
  speaking: '#EF4444',
  speakingBg: '#FEE2E2',

  // Neutral scale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Tab bar
  tabActive: '#00D1A0',
  tabInactive: '#9CA3AF',
  tabBackground: '#FFFFFF',
};

export const TYPOGRAPHY = {
  // Font families (Outfit loaded in App.js)
  fontRegular: 'Outfit_400Regular',
  fontMedium: 'Outfit_500Medium',
  fontSemiBold: 'Outfit_600SemiBold',
  fontBold: 'Outfit_700Bold',
  fontExtraBold: 'Outfit_800ExtraBold',
  fontBlack: 'Outfit_900Black',

  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  '2xl': 26,
  '3xl': 30,
  '4xl': 36,
  '5xl': 44,

  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  primary: {
    shadowColor: '#00D1A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

export default { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, HIT_SLOP };
