import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FacilitiesList } from '../components/FacilitiesList';

export const FacilitiesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <FacilitiesList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
});
