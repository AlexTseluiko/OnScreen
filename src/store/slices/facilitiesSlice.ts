import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MedicalFacility } from '../../types/medical';

interface FacilitiesState {
  items: MedicalFacility[];
  loading: boolean;
  error: string | null;
  selectedFacility: MedicalFacility | null;
  filters: {
    specialties: string[];
    services: string[];
    rating: number | null;
    operatingHours: 'openNow' | '24/7' | 'all';
    searchQuery: string;
  };
}

const initialState: FacilitiesState = {
  items: [],
  loading: false,
  error: null,
  selectedFacility: null,
  filters: {
    specialties: [],
    services: [],
    rating: null,
    operatingHours: 'all',
    searchQuery: '',
  },
};

const facilitiesSlice = createSlice({
  name: 'facilities',
  initialState,
  reducers: {
    setFacilities: (state, action: PayloadAction<MedicalFacility[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    selectFacility: (state, action: PayloadAction<MedicalFacility | null>) => {
      state.selectedFacility = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<FacilitiesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const facility = state.items.find(item => item.id === action.payload);
      if (facility) {
        facility.isFavorite = !facility.isFavorite;
      }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setFacilities,
  setLoading,
  setError,
  selectFacility,
  updateFilters,
  toggleFavorite,
  resetFilters,
} = facilitiesSlice.actions;

export default facilitiesSlice.reducer; 