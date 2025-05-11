import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Card } from '../molecules/Card';

export interface ReviewFormProps {
  onSubmit: (review: { rating: number; text: string; photos?: string[] }) => void;
  initialRating?: number;
  initialText?: string;
  isLoading?: boolean;
  error?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmit,
  initialRating = 0,
  initialText = '',
  isLoading = false,
  error: externalError,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const [rating, setRating] = useState(initialRating);
  const [text, setText] = useState(initialText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalError, setInternalError] = useState('');

  // Объединяем внешние и внутренние ошибки
  const error = externalError || internalError;

  const handleSubmit = async () => {
    if (rating === 0) {
      setInternalError(t('reviews.errorNoRating', 'Пожалуйста, укажите рейтинг'));
      return;
    }

    setInternalError('');
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, text });
      setRating(0);
      setText('');
    } catch (error) {
      console.error('Error submitting review:', error);
      setInternalError(
        t('reviews.errorSubmitting', 'Ошибка при отправке отзыва. Пожалуйста, попробуйте снова.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => setRating(index + 1)}
          style={styles.starButton}
        >
          <Ionicons
            name={index < rating ? 'star' : 'star-outline'}
            size={32}
            color={index < rating ? theme.colors.primary : theme.colors.text.hint}
          />
        </TouchableOpacity>
      ));
  };

  // Используем либо внешнее состояние загрузки, либо внутреннее
  const isLoadingState = isLoading || isSubmitting;

  return (
    <Card style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {error ? (
          <Text variant="error" style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <View style={styles.ratingContainer}>
          <Text variant="subtitle">{t('reviews.rating')}</Text>
          <View style={styles.starsContainer}>{renderStars()}</View>
        </View>

        <View style={styles.textContainer}>
          <Text variant="subtitle">{t('reviews.comment')}</Text>
          <Input
            multiline
            numberOfLines={4}
            placeholder={t('reviews.commentPlaceholder')}
            value={text}
            onChangeText={setText}
            style={styles.textInput}
          />
        </View>

        <Button
          title={t('reviews.submit')}
          onPress={handleSubmit}
          disabled={isLoadingState}
          isLoading={isLoadingState}
          style={styles.submitButton}
        />
      </KeyboardAvoidingView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    marginBottom: 12,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
  },
  textContainer: {
    marginBottom: 16,
  },
  textInput: {
    height: 120,
    marginTop: 8,
    textAlignVertical: 'top',
  },
});
