import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../constants';
import { useTranslation } from 'react-i18next';

interface PersonalInfoSectionProps {
  name: string;
  email: string;
  phone: string;
  address: string;
  onNameChange: (text: string) => void;
  onEmailChange: (text: string) => void;
  onPhoneChange: (text: string) => void;
  onAddressChange: (text: string) => void;
  theme: any;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  name,
  email,
  phone,
  address,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onAddressChange,
  theme,
}) => {
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t('profile.personalInfo')}
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {t('profile.name')}
        </Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.disabled }]}
          value={name}
          onChangeText={onNameChange}
          placeholder={t('profile.enterName')}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.disabled }]}
          value={email}
          onChangeText={onEmailChange}
          placeholder={t('profile.enterEmail')}
          keyboardType="email-address"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {t('profile.phone')}
        </Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.disabled }]}
          value={phone}
          onChangeText={onPhoneChange}
          placeholder={t('profile.enterPhone')}
          keyboardType="phone-pad"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {t('profile.address')}
        </Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.disabled }]}
          value={address}
          onChangeText={onAddressChange}
          placeholder={t('profile.enterAddress')}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  input: {
    borderColor: COLORS.gray,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 16,
    padding: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 4,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
