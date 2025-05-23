import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export const SettingsScreen: React.FC = () => {
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setLanguageModalVisible(false);
  };

  const getLanguageDisplayName = () => {
    switch (i18n.language) {
      case 'ru':
        return 'Русский';
      case 'uk':
        return 'Українська';
      case 'en':
      default:
        return 'English';
    }
  };

  const handleThemeChange = (_theme: 'light' | 'dark') => {
    // Здесь будет логика смены темы
    setThemeModalVisible(false);
  };

  const settingsItems = [
    {
      id: '1',
      title: t('settings.notifications'),
      icon: 'notifications' as const,
      onPress: () => setNotificationsEnabled(!notificationsEnabled),
      rightElement: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: COLORS.light.border, true: COLORS.light.primary }}
          thumbColor={notificationsEnabled ? COLORS.light.background : COLORS.light.secondary}
        />
      ),
    },
    {
      id: '2',
      title: t('settings.privacy'),
      icon: 'shield-checkmark' as const,
      onPress: () => setPrivacyModalVisible(true),
    },
    {
      id: '3',
      title: t('settings.language'),
      icon: 'language' as const,
      onPress: () => setLanguageModalVisible(true),
      rightElement: <Text style={styles.settingItemRightText}>{getLanguageDisplayName()}</Text>,
    },
    {
      id: '4',
      title: t('settings.theme'),
      icon: 'color-palette' as const,
      onPress: () => setThemeModalVisible(true),
      rightElement: <Text style={styles.settingItemRightText}>{t('settings.lightTheme')}</Text>,
    },
    {
      id: '5',
      title: t('settings.about'),
      icon: 'information-circle' as const,
      onPress: () => setAboutModalVisible(true),
    },
  ];

  const renderModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    content: React.ReactNode
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          {content}
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        {settingsItems.map(item => (
          <TouchableOpacity key={item.id} style={styles.settingItem} onPress={item.onPress}>
            <View style={styles.settingItemLeft}>
              <Ionicons name={item.icon} size={24} color={COLORS.light.primary} />
              <Text style={styles.settingItemText}>{item.title}</Text>
            </View>
            {item.rightElement || (
              <Ionicons name="chevron-forward" size={24} color={COLORS.light.secondary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out" size={24} color={COLORS.light.error} />
        <Text style={styles.logoutText}>{t('settings.logout')}</Text>
      </TouchableOpacity>

      {renderModal(
        privacyModalVisible,
        () => setPrivacyModalVisible(false),
        t('settings.privacy'),
        <View style={styles.modalBody}>
          <Text style={styles.modalText}>
            Мы заботимся о вашей конфиденциальности. Все ваши данные надежно защищены и используются
            только для предоставления медицинских услуг.
          </Text>
          <Text style={styles.modalText}>
            Мы не передаем ваши данные третьим лицам без вашего согласия.
          </Text>
        </View>
      )}

      {renderModal(
        languageModalVisible,
        () => setLanguageModalVisible(false),
        t('settings.language'),
        <View style={styles.modalBody}>
          <TouchableOpacity style={styles.modalButton} onPress={() => handleLanguageChange('uk')}>
            <Text style={styles.modalButtonText}>Українська</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={() => handleLanguageChange('ru')}>
            <Text style={styles.modalButtonText}>Русский</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={() => handleLanguageChange('en')}>
            <Text style={styles.modalButtonText}>English</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderModal(
        themeModalVisible,
        () => setThemeModalVisible(false),
        t('settings.theme'),
        <View style={styles.modalBody}>
          <TouchableOpacity style={styles.modalButton} onPress={() => handleThemeChange('light')}>
            <Text style={styles.modalButtonText}>{t('settings.lightTheme')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={() => handleThemeChange('dark')}>
            <Text style={styles.modalButtonText}>{t('settings.darkTheme')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderModal(
        aboutModalVisible,
        () => setAboutModalVisible(false),
        t('settings.about'),
        <View style={styles.modalBody}>
          <Text style={styles.modalText}>Версия: 1.0.0</Text>
          <Text style={styles.modalText}>
            OnScreen - ваше приложение для управления медицинскими услугами.
          </Text>
          <Text style={styles.modalText}>© 2024 OnScreen. Все права защищены.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
    borderColor: COLORS.light.error,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
  },
  logoutText: {
    color: COLORS.light.error,
    fontSize: 16,
    marginLeft: 8,
  },
  modalBody: {
    padding: 16,
  },
  modalButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    marginVertical: 8,
    padding: 16,
  },
  modalButtonText: {
    color: COLORS.light.background,
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: COLORS.light.background,
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: COLORS.light.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flex: 1,
    justifyContent: 'center',
  },
  modalText: {
    color: '#000000',
    fontSize: 16,
    marginBottom: 12,
  },
  modalTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: COLORS.light.background,
    borderRadius: 12,
    margin: 16,
    padding: 8,
  },
  settingItem: {
    alignItems: 'center',
    borderBottomColor: COLORS.light.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  settingItemRightText: {
    color: COLORS.light.secondary,
    fontSize: 16,
  },
  settingItemText: {
    color: '#000000',
    fontSize: 16,
    marginLeft: 12,
  },
});
