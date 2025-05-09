import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { userStorage } from '../../utils/userStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch } from '../store';

export interface SettingsState {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

const initialState: SettingsState = {
  theme: 'light',
  language: 'ru',
  notifications: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications = action.payload;
    },
    resetSettings: () => {
      return initialState;
    },
  },
});

// Экспортируем действие для выхода из аккаунта
export const logoutUser = () => (_dispatch: AppDispatch) => {
  console.log('SettingsSlice: Начинаем очистку данных пользователя');

  // Очищаем данные асинхронно, но не ждем завершения
  userStorage
    .clearUserData()
    .then(() => {
      console.log('SettingsSlice: Данные пользователя успешно удалены');
    })
    .catch((error: Error) => {
      console.error('SettingsSlice: Ошибка при удалении данных пользователя:', error);
    });

  // Асинхронно очищаем данные для AuthContext
  AsyncStorage.removeItem('token')
    .then(() => AsyncStorage.removeItem('user'))
    .then(() => {
      console.log('SettingsSlice: Данные авторизации удалены из AsyncStorage');
    })
    .catch((error: Error) => {
      console.error('SettingsSlice: Ошибка при удалении данных авторизации:', error);
    });

  return true;
};

export const { setTheme, setLanguage, setNotifications, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
