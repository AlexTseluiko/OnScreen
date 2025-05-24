/**
 * Константы теней для всего приложения
 * Поддерживает как веб, так и нативные платформы
 */

import { ViewStyle, Platform } from 'react-native';
import { COLORS } from './colors';

interface WebShadow {
  boxShadow: string;
}

interface NativeShadow {
  elevation: number;
}

export interface ShadowTheme {
  light: {
    web: WebShadow;
    native: NativeShadow;
  };
  dark: {
    web: WebShadow;
    native: NativeShadow;
  };
}

export const shadows: ShadowTheme = {
  light: {
    web: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    native: {
      elevation: 2,
    },
  },
  dark: {
    web: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    },
    native: {
      elevation: 4,
    },
  },
};

// Утилита для получения теней в зависимости от платформы
export const getShadowStyle = (isDark: boolean): ViewStyle => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    } as ViewStyle;
  }
  return {
    elevation: isDark ? 4 : 2,
  };
};
