import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../store';
import { COLORS } from '../constants';
import { Review } from '../types/clinic';

interface ReviewsSectionProps {
  reviews: Review[];
  clinicId: string;
  onAddReview: (review: Omit<Review, '_id' | 'userId'>) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  clinicId,
  onAddReview,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmitReview = () => {
    if (rating === 0) {
      Alert.alert(t('error'), t('pleaseSelectRating'));
      return;
    }

    if (!comment.trim()) {
      Alert.alert(t('error'), t('pleaseEnterComment'));
      return;
    }

    onAddReview({
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    });

    setRating(0);
    setComment('');
    setShowAddReviewModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('reviews')} ({reviews.length})
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddReviewModal(true)}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.white }]}>
            {t('addReview')}
          </Text>
        </TouchableOpacity>
      </View>

      {reviews.map(review => (
        <View key={review._id} style={[styles.reviewItem, { backgroundColor: theme.colors.card }]}>
          <View style={styles.reviewHeader}>
            <Text style={[styles.reviewAuthor, { color: theme.colors.text }]}>{review.userId}</Text>
            <Text style={[styles.reviewDate, { color: theme.colors.textSecondary }]}>
              {new Date(review.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <Text
                key={star}
                style={[
                  styles.star,
                  {
                    color:
                      star <= review.rating ? theme.colors.primary : theme.colors.textSecondary,
                  },
                ]}
              >
                ★
              </Text>
            ))}
          </View>
          <Text style={[styles.reviewComment, { color: theme.colors.text }]}>{review.comment}</Text>
        </View>
      ))}

      <Modal
        visible={showAddReviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddReviewModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('addReview')}</Text>

            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text
                    style={[
                      styles.star,
                      { color: star <= rating ? theme.colors.primary : theme.colors.textSecondary },
                    ]}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[
                styles.commentInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder={t('writeComment')}
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                onPress={() => setShowAddReviewModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.white }]}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSubmitReview}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.white }]}>
                  {t('submit')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  commentInput: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    marginTop: 16,
    padding: 12,
    textAlignVertical: 'top',
  },
  container: {
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    padding: 12,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '90%',
  },
  modalOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: '500',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 14,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewItem: {
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
  },
  star: {
    fontSize: 20,
    marginRight: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReviewsSection;
