import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../constants';
import { useTranslation } from 'react-i18next';

interface EmergencyContactSectionProps {
  name: string;
  phone: string;
  relationship: string;
  onNameChange: (text: string) => void;
  onPhoneChange: (text: string) => void;
  onRelationshipChange: (text: string) => void;
  theme: any;
}

export const EmergencyContactSection: React.FC<EmergencyContactSectionProps> = ({
  name,
  phone,
  relationship,
  onNameChange,
  onPhoneChange,
  onRelationshipChange,
  theme,
}) => {
  const { t } = useTranslation();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.emergencyContact')}</Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('profile.name')}</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.disabled }]}
          value={name}
          onChangeText={onNameChange}
          placeholder={t('profile.enterContactName')}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('profile.phone')}</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.disabled }]}
          value={phone}
          onChangeText={onPhoneChange}
          placeholder={t('profile.enterContactPhone')}
          keyboardType="phone-pad"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('profile.relationship')}</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.disabled }]}
          value={relationship}
          onChangeText={onRelationshipChange}
          placeholder={t('profile.enterRelationship')}
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
  },
}); 