import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

interface ReviewFormProps {
  onSubmit: (review: { rating: number; text: string; photos?: string[] }) => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      // TODO: Show error message
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, text, photos });
      setRating(0);
      setText('');
      setPhotos([]);
    } catch (error) {
      console.error('Error submitting review:', error);
      // TODO: Show error message
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
            color={index < rating ? COLORS.primary : COLORS.gray}
          />
        </TouchableOpacity>
      ));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.ratingContainer}>
        <Text style={styles.label}>{t('reviews.rating')}</Text>
        <View style={styles.starsContainer}>{renderStars()}</View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.label}>{t('reviews.comment')}</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder={t('reviews.commentPlaceholder')}
          value={text}
          onChangeText={setText}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitButtonText}>{t('reviews.submit')}</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    borderColor: COLORS.gray,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 100,
    padding: 12,
    textAlignVertical: 'top',
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  textContainer: {
    marginBottom: 16,
  },
});
