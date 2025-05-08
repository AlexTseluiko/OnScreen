import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { useTranslation } from 'react-i18next';
import { feedbackApi } from '../api/feedback';
import { useTheme } from '../theme/ThemeContext';
import { useAppSelector } from '../store';

export const FeedbackScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const darkMode = useAppSelector(state => state.settings.darkMode);
  
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug' | 'other'>('suggestion');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      Alert.alert(
        t('common.error'),
        t('feedback.emptyFeedbackError'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    setLoading(true);

    try {
      // Отправка обратной связи на сервер
      const response = await feedbackApi.sendFeedback({
        feedbackText,
        feedbackType,
        email: email.trim() || undefined
      });

      Alert.alert(
        t('common.success'),
        t('feedback.submitSuccess'),
        [{ text: t('common.ok') }]
      );

      // Очистить форму
      setFeedbackText('');
      setFeedbackType('suggestion');
      setEmail('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert(
        t('common.error'),
        t('feedback.submitError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderFeedbackTypeButton = (
    type: 'suggestion' | 'bug' | 'other',
    icon: string,
    label: string
  ) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        {
          backgroundColor: feedbackType === type ? theme.colors.primary : theme.colors.card,
          borderColor: theme.colors.primary
        },
        feedbackType === type && styles.selectedTypeButton
      ]}
      onPress={() => setFeedbackType(type)}
    >
      <Ionicons
        name={icon as any}
        size={24}
        color={feedbackType === type ? COLORS.white : theme.colors.primary}
      />
      <Text
        style={[
          styles.typeButtonText,
          { color: feedbackType === type ? COLORS.white : theme.colors.primary },
          feedbackType === type && styles.selectedTypeButtonText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('feedback.title')}</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {t('feedback.subtitle')}
        </Text>
      </View>

      <View style={styles.typesContainer}>
        {renderFeedbackTypeButton('suggestion', 'bulb-outline', t('feedback.suggestion'))}
        {renderFeedbackTypeButton('bug', 'bug-outline', t('feedback.bug'))}
        {renderFeedbackTypeButton('other', 'help-circle-outline', t('feedback.other'))}
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{t('feedback.yourFeedback')}</Text>
        <TextInput
          style={[
            styles.textArea, 
            { 
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: darkMode ? '#555' : '#e0e0e0' 
            }
          ]}
          multiline
          numberOfLines={8}
          placeholder={t('feedback.placeholder')}
          placeholderTextColor={theme.colors.textSecondary}
          value={feedbackText}
          onChangeText={setFeedbackText}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{t('feedback.emailOptional')}</Text>
        <TextInput
          style={[
            styles.input, 
            { 
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: darkMode ? '#555' : '#e0e0e0' 
            }
          ]}
          placeholder={t('feedback.emailPlaceholder')}
          placeholderTextColor={theme.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitButtonText}>{t('feedback.submit')}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{t('feedback.privacyInfo')}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  typesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  selectedTypeButton: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.primary,
  },
  selectedTypeButtonText: {
    color: COLORS.white,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 150,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
}); 