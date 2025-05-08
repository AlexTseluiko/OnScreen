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

      {reviews.map((review) => (
        <View key={review._id} style={[styles.reviewItem, { backgroundColor: theme.colors.card }]}>
          <View style={styles.reviewHeader}>
            <Text style={[styles.reviewAuthor, { color: theme.colors.text }]}>
              {review.userId}
            </Text>
            <Text style={[styles.reviewDate, { color: theme.colors.textSecondary }]}>
              {new Date(review.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text
                key={star}
                style={[
                  styles.star,
                  { color: star <= review.rating ? theme.colors.primary : theme.colors.textSecondary },
                ]}
              >
                ★
              </Text>
            ))}
          </View>
          <Text style={[styles.reviewComment, { color: theme.colors.text }]}>
            {review.comment}
          </Text>
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
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('addReview')}
            </Text>

            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
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
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    fontSize: 20,
    marginRight: 4,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ReviewsSection; 