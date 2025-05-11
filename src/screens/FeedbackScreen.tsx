import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ViewStyle, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { feedbackApi } from '../api/feedback';
import { useTheme } from '../theme/ThemeContext';
import { Text } from '../components/ui/atoms/Text';
import { Button } from '../components/ui/atoms/Button';
import { Input } from '../components/ui/atoms/Input';
import { Card } from '../components/ui/molecules/Card';
import { Icon } from '../components/ui/atoms/Icon';

type FeedbackType = 'suggestion' | 'bug' | 'other';

// Определяем интерфейс для стилей
interface FeedbackScreenStyles {
  container: ViewStyle;
  contentCard: ViewStyle;
  headerCard: ViewStyle;
  headerSubtitle: TextStyle;
  headerTitle: TextStyle;
  infoContainer: ViewStyle;
  infoText: TextStyle;
  inputContainer: ViewStyle;
  sectionTitle: TextStyle;
  submitButton: ViewStyle;
  textArea: ViewStyle & { textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center' };
  typeButton: ViewStyle;
  typesContainer: ViewStyle;
}

export const FeedbackScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
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

  const renderFeedbackTypeButton = (type: FeedbackType, iconName: string, label: string) => {
    const isSelected = feedbackType === type;

    return (
      <Button
        title={label}
        variant={isSelected ? 'primary' : 'outline'}
        size="small"
        style={styles.typeButton}
        leftIcon={
          <Icon
            name={iconName}
            family="ionicons"
            size={20}
            color={isSelected ? theme.colors.text.inverse : theme.colors.primary}
          />
        }
        onPress={() => setFeedbackType(type)}
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card elevated={false} containerStyle={styles.headerCard}>
        <Text variant="heading" style={{ ...styles.headerTitle, color: theme.colors.text.primary }}>
          {t('feedback.title')}
        </Text>
        <Text
          variant="body"
          style={{ ...styles.headerSubtitle, color: theme.colors.text.secondary }}
        >
          {t('feedback.subtitle')}
        </Text>
      </Card>

      <Card elevated containerStyle={styles.contentCard}>
        <Text variant="subtitle" style={styles.sectionTitle}>
          {t('feedback.typeQuestion')}
        </Text>

        <View style={styles.typesContainer}>
          {renderFeedbackTypeButton('suggestion', 'bulb-outline', t('feedback.suggestion'))}
          {renderFeedbackTypeButton('bug', 'bug-outline', t('feedback.bug'))}
          {renderFeedbackTypeButton('other', 'help-circle-outline', t('feedback.other'))}
        </View>

        <Input
          label={t('feedback.yourFeedback')}
          multiline
          numberOfLines={8}
          placeholder={t('feedback.placeholder')}
          value={feedbackText}
          onChangeText={setFeedbackText}
          textAlignVertical="top"
          inputStyle={styles.textArea}
          containerStyle={styles.inputContainer}
        />

        <Input
          label={t('feedback.emailOptional')}
          placeholder={t('feedback.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.inputContainer}
        />

        <Button
          title={t('feedback.submit')}
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          style={styles.submitButton}
        />

        <View style={styles.infoContainer}>
          <Icon
            name="information-circle-outline"
            family="ionicons"
            size={20}
            color={theme.colors.text.secondary}
          />
          <Text
            variant="caption"
            style={{ ...styles.infoText, color: theme.colors.text.secondary }}
          >
            {t('feedback.privacyInfo')}
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create<FeedbackScreenStyles>({
  container: {
    flex: 1,
    padding: 16,
  },
  contentCard: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    padding: 16,
  },
  headerSubtitle: {
    marginTop: 8,
  },
  headerTitle: {},
  infoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  submitButton: {
    marginBottom: 16,
    marginTop: 8,
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  typesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
});
