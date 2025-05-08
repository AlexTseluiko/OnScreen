import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAppSelector } from '../store';

type ThemeType = 'light' | 'dark';

interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  white: string;
  disabled: string;
  error: string;
  success: string;
  border: string;
  inputBackground: string;
  placeholder: string;
  cardBackground: string;
}

interface Theme {
  type: ThemeType;
  colors: ThemeColors;
}

const lightTheme: Theme = {
  type: 'light',
  colors: {
    primary: '#007AFF',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    white: '#FFFFFF',
    disabled: '#C7C7CC',
    error: '#FF3B30',
    success: '#34C759',
    border: '#C6C6C8',
    inputBackground: '#FFFFFF',
    placeholder: '#C7C7CC',
    cardBackground: '#FFFFFF',
  },
};

const darkTheme: Theme = {
  type: 'dark',
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    white: '#FFFFFF',
    disabled: '#3A3A3C',
    error: '#FF453A',
    success: '#30D158',
    border: '#38383A',
    inputBackground: '#1C1C1E',
    placeholder: '#8E8E93',
    cardBackground: '#1C1C1E',
  },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  // Получаем текущее состояние темной темы из Redux
  let darkModeFromRedux = false;
  try {
    const settings = useAppSelector(state => state.settings);
    if (settings) {
      darkModeFromRedux = settings.darkMode;
    }
  } catch (error) {
    console.error('Error getting darkMode from Redux:', error);
  }

  // Используем значение из Redux, если оно есть, или системное значение в противном случае
  const [themeType, setThemeType] = useState<ThemeType>(
    darkModeFromRedux ? 'dark' : systemColorScheme === 'dark' ? 'dark' : 'light'
  );

  // Синхронизируем с настройками из Redux при их изменении
  useEffect(() => {
    setThemeType(darkModeFromRedux ? 'dark' : 'light');
  }, [darkModeFromRedux]);

  // Обновляем тему при изменении системной темы, если не указана явная тема в Redux
  useEffect(() => {
    if (!darkModeFromRedux) {
      setThemeType(systemColorScheme || 'light');
    }
  }, [systemColorScheme, darkModeFromRedux]);

  const toggleTheme = () => {
    setThemeType(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = themeType === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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