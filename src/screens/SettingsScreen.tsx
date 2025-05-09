import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/index';
import { setTheme, setLanguage, setNotifications } from '../store/slices/settingsSlice';
import { COLORS } from '../constants/colors';
import { spacing } from '../constants/styles';

export const SettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);

  const handleThemeChange = () => {
    dispatch(setTheme(settings.theme === 'light' ? 'dark' : 'light'));
  };

  const handleLanguageChange = () => {
    dispatch(setLanguage(settings.language === 'ru' ? 'en' : 'ru'));
  };

  const handleNotificationsChange = (value: boolean) => {
    dispatch(setNotifications(value));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('settings.title')}</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('settings.theme')}
        </Text>
        <TouchableOpacity
          style={[styles.option, { backgroundColor: theme.colors.card }]}
          onPress={handleThemeChange}
        >
          <Text style={[styles.optionText, { color: theme.colors.text }]}>
            {settings.theme === 'light' ? t('settings.lightTheme') : t('settings.darkTheme')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('settings.language')}
        </Text>
        <TouchableOpacity
          style={[styles.option, { backgroundColor: theme.colors.card }]}
          onPress={handleLanguageChange}
        >
          <Text style={[styles.optionText, { color: theme.colors.text }]}>
            {settings.language === 'ru' ? 'Русский' : 'English'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('settings.notifications')}
        </Text>
        <View style={[styles.option, { backgroundColor: theme.colors.card }]}>
          <Switch
            value={settings.notifications}
            onValueChange={handleNotificationsChange}
            trackColor={{ false: COLORS.gray[400], true: COLORS.primary }}
            thumbColor={settings.notifications ? COLORS.white : COLORS.gray[400]}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: COLORS.danger }]}
        onPress={logout}
      >
        <Text style={styles.logoutButtonText}>{t('settings.logout')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.medium,
  },
  logoutButton: {
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 30,
    padding: 15,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  option: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  optionText: {
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
});
