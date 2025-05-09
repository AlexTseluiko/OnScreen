import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    auth: authReducer,
    profile: profileReducer,
  },
});
