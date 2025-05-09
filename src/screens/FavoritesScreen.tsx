import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store';
import { MedicalFacility } from '../types/medical';
import { COLORS } from '../constants';

export const FavoritesScreen: React.FC = () => {
  const { t } = useTranslation();
  const favorites = useAppSelector(state => state.facilities.items.filter(f => f.isFavorite));

  const renderItem = ({ item }: { item: MedicalFacility }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.address}>{item.address}</Text>
      <View style={styles.ratingContainer}>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
        <Text style={styles.type}>{t(`filters.${item.type}`)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('favorites.empty')}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  address: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    elevation: 5,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  list: {
    padding: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rating: {
    color: COLORS.primary,
    fontSize: 14,
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  type: {
    color: '#666',
    fontSize: 14,
  },
});
