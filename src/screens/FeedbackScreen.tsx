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

type IconName =
  | 'bulb-outline'
  | 'bug-outline'
  | 'help-circle-outline'
  | 'information-circle-outline';

export const FeedbackScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug' | 'other'>('suggestion');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      Alert.alert(t('common.error'), t('feedback.emptyFeedbackError'), [{ text: t('common.ok') }]);
      return;
    }

    setLoading(true);

    try {
      await feedbackApi.sendFeedback({
        feedbackText,
        feedbackType,
        email: email.trim() || undefined,
      });

      Alert.alert(t('common.success'), t('feedback.submitSuccess'), [{ text: t('common.ok') }]);

      // Очистить форму
      setFeedbackText('');
      setFeedbackType('suggestion');
      setEmail('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert(t('common.error'), t('feedback.submitError'), [{ text: t('common.ok') }]);
    } finally {
      setLoading(false);
    }
  };

  const renderFeedbackTypeButton = (
    type: 'suggestion' | 'bug' | 'other',
    icon: IconName,
    label: string
  ) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        {
          backgroundColor: feedbackType === type ? theme.colors.primary : theme.colors.card,
          borderColor: theme.colors.primary,
        },
        feedbackType === type && styles.selectedTypeButton,
      ]}
      onPress={() => setFeedbackType(type)}
    >
      <Ionicons
        name={icon}
        size={24}
        color={feedbackType === type ? COLORS.white : theme.colors.primary}
      />
      <Text
        style={[
          styles.typeButtonText,
          { color: feedbackType === type ? COLORS.white : theme.colors.primary },
          feedbackType === type && styles.selectedTypeButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('feedback.title')}
        </Text>
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
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('feedback.yourFeedback')}
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
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
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('feedback.emailOptional')}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
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
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          {t('feedback.privacyInfo')}
        </Text>
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
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    padding: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedTypeButton: {
    backgroundColor: COLORS.primary,
  },
  selectedTypeButtonText: {
    color: COLORS.white,
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 24,
    marginTop: 16,
    paddingVertical: 16,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textArea: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 150,
    padding: 12,
  },
  typeButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 4,
    padding: 12,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
});
