/**
 * Константы теней для всего приложения
 * Поддерживает как веб, так и нативные платформы
 */

import { Platform, ViewStyle } from 'react-native';
import { COLORS } from './colors';

interface WebShadow {
  boxShadow: string;
}

interface NativeShadow {
  elevation: number;
  shadowColor: string;
  shadowOffset: {
    width: number;
    height: number;
  };
  shadowOpacity: number;
  shadowRadius: number;
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
      elevation: 3,
      shadowColor: COLORS.palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
  },
  dark: {
    web: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    },
    native: {
      elevation: 3,
      shadowColor: COLORS.palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
  },
} as const;

// Утилита для получения теней в зависимости от платформы
export const getShadowStyle = (isDark: boolean): ViewStyle => {
  if (Platform.OS === 'web') {
    return {
      // @ts-expect-error - boxShadow поддерживается в веб-версии
      boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    } as ViewStyle;
  }

  return {
    shadowColor: isDark ? '#000' : '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 4,
  };
};
