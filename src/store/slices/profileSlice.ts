import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from '../types';

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  specialization?: string;
  experience?: number;
  education?: string[];
  languages?: string[];
  bio?: string;
  rating?: number;
  reviews?: number;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Profile>) => {
      state.profile = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearProfile: state => {
      state.profile = null;
      state.error = null;
    },
  },
});

export const { setProfile, setLoading, setError, clearProfile } = profileSlice.actions;

// Thunks
export const fetchProfile = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    // Здесь будет вызов API для получения профиля
    // const response = await profileApi.getProfile();
    // dispatch(setProfile(response.data));
  } catch (error) {
    dispatch(
      setError(error instanceof Error ? error.message : 'Произошла ошибка при загрузке профиля')
    );
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateProfile = (_profileData: Partial<Profile>) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    // Здесь будет вызов API для обновления профиля
    // const response = await profileApi.updateProfile(profileData);
    // dispatch(setProfile(response.data));
  } catch (error) {
    dispatch(
      setError(error instanceof Error ? error.message : 'Произошла ошибка при обновлении профиля')
    );
  } finally {
    dispatch(setLoading(false));
  }
};

export default profileSlice.reducer;
