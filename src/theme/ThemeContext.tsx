/**
 * Контекст темы приложения
 * Предоставляет доступ к текущей теме и функции для её переключения
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from './colors';
import { borderRadius } from './theme';

export type ThemeType = {
  name: 'light' | 'dark';
  colors: typeof COLORS.light | typeof COLORS.dark;
  borderRadius?: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
};

export interface ThemeContextType {
  isDark: boolean;
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType['name']) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [theme, setTheme] = useState<ThemeType>({
    name: systemColorScheme || 'light',
    colors: COLORS[systemColorScheme || 'light'],
    borderRadius,
  });

  const toggleTheme = useCallback(() => {
    const newThemeName = theme.name === 'light' ? 'dark' : 'light';
    setTheme({
      name: newThemeName,
      colors: COLORS[newThemeName],
      borderRadius,
    });
    setIsDark(newThemeName === 'dark');
  }, [theme.name]);

  const handleSetTheme = useCallback((newThemeName: ThemeType['name']) => {
    setTheme({
      name: newThemeName,
      colors: COLORS[newThemeName],
      borderRadius,
    });
    setIsDark(newThemeName === 'dark');
  }, []);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          handleSetTheme(savedTheme as ThemeType['name']);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, [handleSetTheme]);

  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem('theme', theme.name);
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    };

    saveThemePreference();
  }, [theme.name]);

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
