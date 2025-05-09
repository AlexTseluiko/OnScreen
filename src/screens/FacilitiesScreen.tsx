import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FacilitiesList } from '../components/FacilitiesList';
import { COLORS } from '../theme/colors';

export const FacilitiesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <FacilitiesList facilities={[]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.lightGray,
    flex: 1,
  },
});
