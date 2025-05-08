import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { COLORS } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';

interface AdditionalInfoSectionProps {
  height: string;
  weight: string;
  preferredLanguage: string;
  onHeightChange: (text: string) => void;
  onWeightChange: (text: string) => void;
  onPreferredLanguageChange: (text: string) => void;
  theme: any; // Объект темы
}

export const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  height,
  weight,
  preferredLanguage,
  onHeightChange,
  onWeightChange,
  onPreferredLanguageChange,
  theme,
}) => {
  const { t } = useTranslation();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [tempLanguage, setTempLanguage] = useState(preferredLanguage);
  
  // Обновляем tempLanguage при изменении preferredLanguage из props
  useEffect(() => {
    setTempLanguage(preferredLanguage);
  }, [preferredLanguage]);

  // Список доступных языков
  const languages = [
    { code: 'ru', name: 'Русский' },
    { code: 'en', name: 'English' },
    { code: 'uk', name: 'Українська' },
  ];

  // Получаем название языка по коду
  const getLanguageName = (code: string) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : '';
  };
  
  // Подтверждение выбора языка
  const confirmLanguageSelection = () => {
    setShowLanguagePicker(false);
    // Вызываем колбэк для обновления значения в родительском компоненте
    onPreferredLanguageChange(tempLanguage);
    console.log('Выбранный язык:', tempLanguage, getLanguageName(tempLanguage));
  };
  
  // Отмена выбора языка
  const cancelLanguageSelection = () => {
    setShowLanguagePicker(false);
    setTempLanguage(preferredLanguage); // Сбрасываем значение
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.additionalInfo')}</Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('profile.height')} (см)</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.disabled }]}
          value={height}
          onChangeText={onHeightChange}
          placeholder={t('profile.enterHeight')}
          keyboardType="numeric"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('profile.weight')} (кг)</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.disabled }]}
          value={weight}
          onChangeText={onWeightChange}
          placeholder={t('profile.enterWeight')}
          keyboardType="numeric"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('profile.preferredLanguage')}</Text>
        <TouchableOpacity
          style={[styles.input, { borderColor: theme.colors.disabled }]}
          onPress={() => setShowLanguagePicker(true)}
        >
          <Text style={[
            styles.inputText, 
            !preferredLanguage ? { color: theme.colors.textSecondary } : { color: theme.colors.text }
          ]}>
            {getLanguageName(preferredLanguage) || t('profile.selectLanguage')}
          </Text>
          <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        
        <Modal
          transparent={true}
          visible={showLanguagePicker}
          animationType="slide"
          onRequestClose={cancelLanguageSelection}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.pickerHeader, { borderBottomColor: theme.colors.disabled }]}>
                <TouchableOpacity onPress={cancelLanguageSelection}>
                  <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>{t('profile.selectLanguage')}</Text>
                <TouchableOpacity onPress={confirmLanguageSelection}>
                  <Text style={[styles.doneText, { color: theme.colors.primary }]}>{t('common.done')}</Text>
                </TouchableOpacity>
              </View>
              
              {Platform.OS === 'web' ? (
                <View style={styles.webPickerContainer}>
                  {languages.map((lang) => (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.webPickerItem,
                        tempLanguage === lang.code && styles.webPickerItemSelected,
                        { borderColor: theme.colors.disabled }
                      ]}
                      onPress={() => setTempLanguage(lang.code)}
                    >
                      <Text style={{ 
                        color: tempLanguage === lang.code ? theme.colors.primary : theme.colors.text,
                        fontWeight: tempLanguage === lang.code ? 'bold' : 'normal'
                      }}>
                        {lang.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Picker
                  selectedValue={tempLanguage}
                  onValueChange={(itemValue) => setTempLanguage(itemValue)}
                  itemStyle={{ color: theme.colors.text }}
                >
                  <Picker.Item label={t('profile.selectLanguage')} value="" />
                  {languages.map((lang) => (
                    <Picker.Item key={lang.code} label={lang.name} value={lang.code} />
                  ))}
                </Picker>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.text,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
    color: COLORS.text,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cancelText: {
    color: COLORS.gray,
    fontSize: 16,
  },
  doneText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  webPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 15,
  },
  webPickerItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    margin: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  webPickerItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
}); 