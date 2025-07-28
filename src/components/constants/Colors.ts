export const Colors = {
  // Primary palette
  primary: {
    main: '#6366F1',      // Indigo
    light: '#8B8CF8',     // Light indigo
    dark: '#4F46E5',      // Dark indigo
    contrast: '#FFFFFF',   // White text on primary
  },
  
  // Secondary palette
  secondary: {
    main: '#EC4899',      // Pink
    light: '#F472B6',     // Light pink
    dark: '#DB2777',      // Dark pink
    contrast: '#FFFFFF',
  },
  
  // Neutral colors
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Background
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  
  // Borders
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
} as const;