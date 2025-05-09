import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { COLORS } from '../constants';

interface ReviewItemProps {
  review: {
    id: number;
    rating: number;
    text: string;
    author: string;
    date: Date;
    photos?: string[];
  };
}

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3;

export const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Text
          key={index}
          style={[styles.star, { color: index < rating ? COLORS.primary : COLORS.gray }]}
        >
          ★
        </Text>
      ));
  };

  const formatDate = (date: Date) => {
    const day = format(date, 'dd');
    const month = format(date, 'MMMM');
    const year = format(date, 'yyyy');
    return `${day} ${month} ${year}`;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Text style={styles.author}>{review.author}</Text>
          <Text style={styles.date}>{formatDate(review.date)}</Text>
        </View>
        <View style={styles.rating}>{renderStars(review.rating)}</View>
      </View>

      <Text style={styles.text}>{review.text}</Text>

      {review.photos && review.photos.length > 0 && (
        <View style={styles.photosContainer}>
          {review.photos.map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.photo} />
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  author: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  authorInfo: {
    flex: 1,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  date: {
    color: COLORS.gray,
    fontSize: 12,
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
  star: {
    fontSize: 16,
    marginLeft: 2,
  },
  text: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
});
