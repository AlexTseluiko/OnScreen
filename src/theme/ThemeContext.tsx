import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { setTheme } from '../store/slices/settingsSlice';
import { lightTheme, darkTheme, Theme } from './theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { theme: themeMode } = useAppSelector(state => state.settings);
  const [isDark, setIsDark] = useState(themeMode === 'dark');

  useEffect(() => {
    setIsDark(themeMode === 'dark');
  }, [themeMode]);

  useEffect(() => {
    if (colorScheme) {
      dispatch(setTheme(colorScheme));
    }
  }, [colorScheme, dispatch]);

  const toggleTheme = () => {
    dispatch(setTheme(isDark ? 'light' : 'dark'));
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
