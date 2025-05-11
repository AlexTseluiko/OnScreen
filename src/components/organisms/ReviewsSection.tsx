import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { ReviewItem } from '../molecules/ReviewItem';
import { ReviewForm } from './ReviewForm';
import { Card } from '../molecules/Card';

// Константы для цветов
const MODAL_OVERLAY_ALPHA = 'rgba(0, 0, 0, 0.5)';
const PHOTO_MODAL_OVERLAY_ALPHA = 'rgba(0, 0, 0, 0.9)';
const WHITE_COLOR = '#FFFFFF';

export interface Review {
  id: number;
  rating: number;
  text: string;
  author: string;
  date: Date;
  photos?: string[];
}

export interface ReviewsSectionProps {
  reviews: Review[];
  title?: string;
  onAddReview: (review: { rating: number; text: string; photos?: string[] }) => void;
  isAddingReview?: boolean;
  error?: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  title = 'Отзывы',
  onAddReview,
  isAddingReview = false,
  error,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [selectedReviewPhotos, setSelectedReviewPhotos] = useState<string[]>([]);

  const handleReviewSubmit = (reviewData: { rating: number; text: string }) => {
    onAddReview(reviewData);
    if (!error) {
      setShowAddReviewModal(false);
    }
  };

  const handlePhotoPress = (reviewIndex: number, photoIndex: number) => {
    if (reviews[reviewIndex]?.photos) {
      setSelectedReviewPhotos(reviews[reviewIndex].photos || []);
      setSelectedPhotoIndex(photoIndex);
    }
  };

  const closePhotoModal = () => {
    setSelectedPhotoIndex(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="title">
          {title} ({reviews.length})
        </Text>
        <Button
          title={t('reviews.addReview', 'Оставить отзыв')}
          onPress={() => setShowAddReviewModal(true)}
          style={styles.addButton}
        />
      </View>

      {reviews.length === 0 ? (
        <Card style={styles.emptyContainer}>
          <Text variant="secondary" style={styles.emptyText}>
            {t('reviews.noReviews', 'Пока нет отзывов. Будьте первым, кто оставит отзыв!')}
          </Text>
        </Card>
      ) : (
        <ScrollView>
          {reviews.map((review, index) => (
            <ReviewItem
              key={review.id}
              review={review}
              onPhotoPress={
                review.photos?.length
                  ? photoIndex => handlePhotoPress(index, photoIndex)
                  : undefined
              }
            />
          ))}
        </ScrollView>
      )}

      {/* Модальное окно для добавления отзыва */}
      <Modal
        visible={showAddReviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? theme.colors.surface : theme.colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text variant="title">{t('reviews.addReview', 'Оставить отзыв')}</Text>
              <TouchableOpacity onPress={() => setShowAddReviewModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ReviewForm onSubmit={handleReviewSubmit} isLoading={isAddingReview} error={error} />
          </View>
        </View>
      </Modal>

      {/* Модальное окно для просмотра фото */}
      <Modal
        visible={selectedPhotoIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={closePhotoModal}
      >
        {selectedPhotoIndex !== null && selectedReviewPhotos.length > 0 && (
          <View style={styles.photoModalOverlay}>
            <TouchableOpacity style={styles.photoCloseButton} onPress={closePhotoModal}>
              <Ionicons name="close" size={28} color={WHITE_COLOR} />
            </TouchableOpacity>
            <View style={styles.photoModalContent}>
              {selectedPhotoIndex !== null && (
                <ScrollView horizontal pagingEnabled>
                  {selectedReviewPhotos.map((photo, index) => (
                    <View key={index} style={styles.photoContainer}>
                      <TouchableOpacity
                        style={styles.photoNavigationButton}
                        disabled={index === 0}
                        onPress={() => setSelectedPhotoIndex(index - 1)}
                      >
                        {index !== 0 && (
                          <Ionicons name="chevron-back" size={36} color={WHITE_COLOR} />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.photo} activeOpacity={1}>
                        <TouchableOpacity style={styles.photoCloseButton} onPress={closePhotoModal}>
                          <Ionicons name="close" size={28} color={WHITE_COLOR} />
                        </TouchableOpacity>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.photoNavigationButton}
                        disabled={index === selectedReviewPhotos.length - 1}
                        onPress={() => setSelectedPhotoIndex(index + 1)}
                      >
                        {index !== selectedReviewPhotos.length - 1 && (
                          <Ionicons name="chevron-forward" size={36} color={WHITE_COLOR} />
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    minWidth: 150,
  },
  container: {
    marginVertical: 16,
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalContent: {
    borderRadius: 12,
    maxHeight: '80%',
    padding: 24,
    width: '90%',
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: MODAL_OVERLAY_ALPHA,
    flex: 1,
    justifyContent: 'center',
  },
  photo: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  photoCloseButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
  },
  photoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'center',
    width: 300,
  },
  photoModalContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  photoModalOverlay: {
    alignItems: 'center',
    backgroundColor: PHOTO_MODAL_OVERLAY_ALPHA,
    flex: 1,
    justifyContent: 'center',
  },
  photoNavigationButton: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: 50,
  },
});
