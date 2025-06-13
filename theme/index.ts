import { Platform } from 'react-native';

export const theme = {
  colors: {
    primary: '#5F4B8B',    // Violet profond
    secondary: '#F4C542',  // Doré
    white: '#FFFFFF',      // Blanc
    background: '#F5F5F5', // Gris clair
    text: {
      primary: '#5F4B8B',
      secondary: '#666666',
      light: '#FFFFFF',
      accent: '#F4C542',
    },
  },
  typography: {
    title: {
      fontFamily: Platform.select({
        ios: 'PlayfairDisplay_700Bold',
        android: 'PlayfairDisplay_700Bold',
        web: 'Playfair Display, serif',
      }),
      fontSize: {
        large: 30,
        medium: 24,
        small: 20,
      },
      fontWeight: 'bold',
    },
    body: {
      fontFamily: Platform.select({
        ios: 'Roboto_400Regular',
        android: 'Roboto_400Regular',
        web: 'Roboto, sans-serif',
      }),
      fontSize: {
        large: 18,
        medium: 16,
        small: 14,
      },
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 20,
    circle: 9999,
  },
  shadows: {
    light: {
      shadowColor: '#5F4B8B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#5F4B8B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 5,
    },
  },
};