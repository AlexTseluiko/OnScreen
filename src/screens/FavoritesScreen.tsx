import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { Doctor } from '../types/doctor';
import { DoctorCard } from '../components/DoctorCard';

export const FavoritesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [favorites, setFavorites] = useState<Doctor[]>([]);

  const removeFromFavorites = (doctorId: string) => {
    setFavorites(favorites.filter(doctor => doctor.id !== doctorId));
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
        {t('favorites.empty')}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <DoctorCard
            doctor={item}
            onPress={() => {}}
            onFavoritePress={() => removeFromFavorites(item.id)}
            isFavorite={true}
          />
        )}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
});
