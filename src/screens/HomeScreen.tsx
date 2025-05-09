import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../theme/colors';

interface CardItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

export const HomeScreen: React.FC = () => {
  const renderItem = ({ item }: { item: CardItem }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.list}
        data={[]}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 12,
    elevation: 3,
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
    shadowColor: COLORS.light.text,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '48%',
  },
  cardContent: {
    padding: 16,
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  image: {
    borderRadius: 8,
    height: '100%',
    width: '100%',
  },
  list: {
    padding: 16,
  },
  subtitle: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
  },
  title: {
    color: COLORS.light.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
