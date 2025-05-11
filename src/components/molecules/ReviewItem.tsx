import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, TouchableOpacity } from 'react-native';
import { formatDate } from '../../utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui/atoms/Text';
import { Card } from '../ui/atoms/Card';
import { themes } from '../../theme/theme';

const PHOTO_SIZE = 80;

export interface ReviewItemProps {
  review: {
    id: number;
    rating: number;
    text: string;
    author: string;
    date: Date;
    photos?: string[];
  };
  onPhotoPress?: (photoIndex: number) => void;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({ review, onPhotoPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { isDark } = useTheme();
  const theme = isDark ? themes.dark : themes.light;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Ionicons
          key={index}
          name={index < rating ? 'star' : 'star-outline'}
          size={16}
          color={index < rating ? theme.colors.primary : theme.colors.text.secondary}
          style={styles.star}
        />
      ));
  };

  const formatReviewDate = (date: Date) => {
    try {
      // Преобразуем Date в строку ISO для нашей утилиты formatDate
      const dateString = date.toISOString();
      return formatDate(dateString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Недействительная дата';
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Card>
        <View style={styles.header}>
          <View style={styles.authorInfo}>
            <Text variant="subtitle">{review.author}</Text>
            <Text variant="caption">{formatReviewDate(review.date)}</Text>
          </View>
          <View style={styles.rating}>{renderStars(review.rating)}</View>
        </View>

        <Text style={styles.reviewText}>{review.text}</Text>

        {review.photos && review.photos.length > 0 && (
          <View style={styles.photosContainer}>
            {review.photos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onPhotoPress && onPhotoPress(index)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: photo }} style={styles.photo} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  authorInfo: {
    flex: 1,
  },
  container: {
    marginBottom: 16,
    width: '100%',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photo: {
    borderRadius: 8,
    height: PHOTO_SIZE,
    marginBottom: 8,
    marginRight: 8,
    width: PHOTO_SIZE,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  rating: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  reviewText: {
    lineHeight: 20,
    marginBottom: 12,
  },
  star: {
    marginLeft: 2,
  },
});
