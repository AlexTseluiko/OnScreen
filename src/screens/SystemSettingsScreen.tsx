import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

interface Setting {
  id: string;
  title: string;
  description: string;
  type: 'toggle' | 'select';
  value: boolean | string;
  options?: { label: string; value: string }[];
}

const SystemSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: 'notifications',
      title: 'Уведомления',
      description: 'Получать уведомления о новых сообщениях и событиях',
      type: 'toggle',
      value: true,
    },
    {
      id: 'autoBackup',
      title: 'Автоматическое резервное копирование',
      description: 'Создавать резервные копии данных каждый день',
      type: 'toggle',
      value: false,
    },
    {
      id: 'language',
      title: 'Язык',
      description: 'Выберите предпочитаемый язык интерфейса',
      type: 'select',
      value: 'ru',
      options: [
        { label: 'Русский', value: 'ru' },
        { label: 'English', value: 'en' },
      ],
    },
    {
      id: 'theme',
      title: 'Тема',
      description: 'Выберите тему оформления приложения',
      type: 'select',
      value: 'light',
      options: [
        { label: 'Светлая', value: 'light' },
        { label: 'Темная', value: 'dark' },
      ],
    },
  ]);

  const handleToggleChange = (id: string) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, value: !setting.value } : setting
      )
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Настройки системы</Text>
        <Text style={styles.subtitle}>Управление настройками приложения</Text>
      </View>

      <View style={styles.section}>
        {settings.map(setting => (
          <View key={setting.id} style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
            {setting.type === 'toggle' ? (
              <Switch
                value={setting.value as boolean}
                onValueChange={() => handleToggleChange(setting.id)}
                trackColor={{ false: COLORS.light.border, true: COLORS.light.primary }}
                thumbColor={COLORS.light.whiteBackground}
              />
            ) : (
              <View style={styles.selectContainer}>
                <Text style={styles.selectValue}>
                  {setting.options?.find(opt => opt.value === setting.value)?.label}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.light.textSecondary} />
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Опасная зона</Text>
        <TouchableOpacity style={styles.dangerButton}>
          <Ionicons name="trash-outline" size={20} color={COLORS.light.error} />
          <Text style={styles.dangerButtonText}>Очистить все данные</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  dangerButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.whiteBackground,
    borderColor: COLORS.light.error,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    padding: 16,
  },
  dangerButtonText: {
    color: COLORS.light.error,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  header: {
    backgroundColor: COLORS.light.whiteBackground,
    padding: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: COLORS.light.text,
    fontSize: 18,
    fontWeight: '600',
  },
  selectContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.light.whiteBackground,
    borderColor: COLORS.light.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectValue: {
    color: COLORS.light.text,
    fontSize: 14,
    marginRight: 8,
  },
  settingDescription: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingItem: {
    alignItems: 'center',
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
  },
  settingTitle: {
    color: COLORS.light.text,
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    color: COLORS.light.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
  title: {
    color: COLORS.light.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default SystemSettingsScreen;
