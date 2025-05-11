/**
 * Константы анимаций для всего приложения
 * Обеспечивает единообразие анимаций во всем приложении
 */

export interface AnimationTheme {
  duration: {
    shortest: number;
    shorter: number;
    short: number;
    standard: number;
    complex: number;
    enteringScreen: number;
    leavingScreen: number;
  };
  easing: {
    easeInOut: string;
    easeOut: string;
    easeIn: string;
    sharp: string;
  };
}

export const animations: AnimationTheme = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
} as const;

// Утилиты для создания анимаций
export const createAnimation = (
  duration: keyof AnimationTheme['duration'] = 'standard',
  easing: keyof AnimationTheme['easing'] = 'easeInOut'
) => ({
  duration: animations.duration[duration],
  easing: animations.easing[easing],
});

export const ANIMATION = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'easeIn',
    EASE_OUT: 'easeOut',
    EASE_IN_OUT: 'easeInOut',
    LINEAR: 'linear',
  },
} as const;

export type AnimationDuration = (typeof ANIMATION.DURATION)[keyof typeof ANIMATION.DURATION];
export type AnimationEasing = (typeof ANIMATION.EASING)[keyof typeof ANIMATION.EASING];
