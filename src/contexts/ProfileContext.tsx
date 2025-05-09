import React, { createContext, useContext, useState } from 'react';
import { Profile } from '../types/profile';
import { getProfile, updateProfile } from '../api/profileApi';

export interface ProfileContextType {
  profile: Profile | null;
  profileLoading: boolean;
  profileError: string | null;
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);

      const response = await getProfile();
      setProfile(response);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const updateProfileData = async (data: Partial<Profile>) => {
    try {
      setProfileLoading(true);
      setProfileError(null);

      const updatedProfile = await updateProfile(data);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError(error instanceof Error ? error.message : 'Failed to update profile');
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setProfileError(null);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        profileLoading,
        profileError,
        loadProfile,
        updateProfile: updateProfileData,
        clearProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
