import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { userStorage } from '../../utils/userStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  language: string;
  darkMode: boolean;
  notifications: boolean;
}

const initialState: SettingsState = {
  language: 'en',
  darkMode: false,
  notifications: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    },
  },
});

// Экспортируем действие для выхода из аккаунта
export const logoutUser = () => (dispatch: any) => {
  console.log('SettingsSlice: Начинаем очистку данных пользователя');
  
  // Очищаем данные асинхронно, но не ждем завершения
  userStorage.removeUserData()
    .then(() => {
      console.log('SettingsSlice: Данные пользователя успешно удалены');
    })
    .catch(error => {
      console.error('SettingsSlice: Ошибка при удалении данных пользователя:', error);
    });
  
  // Асинхронно очищаем данные для AuthContext
  AsyncStorage.removeItem('token')
    .then(() => AsyncStorage.removeItem('user'))
    .then(() => {
      console.log('SettingsSlice: Данные авторизации удалены из AsyncStorage');
    })
    .catch(error => {
      console.error('SettingsSlice: Ошибка при удалении данных авторизации:', error);
    });
  
  return true;
};

export const {
  setLanguage,
  toggleDarkMode,
  toggleNotifications,
} = settingsSlice.actions;

export default settingsSlice.reducer; 