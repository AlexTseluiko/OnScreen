import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { Facility } from '../types/facility';
import { FacilityItem } from './FacilityItem';

interface FacilitiesListProps {
  facilities: Facility[];
  onFacilityPress?: (facility: Facility) => void;
  ListEmptyComponent?:
    | React.ComponentType<{ style?: View['props']['style'] }>
    | React.ReactElement
    | null;
}

export const FacilitiesList: React.FC<FacilitiesListProps> = ({
  facilities,
  onFacilityPress,
  ListEmptyComponent,
}) => {
  return (
    <FlatList
      data={facilities}
      renderItem={({ item }) => <FacilityItem facility={item} onPress={onFacilityPress} />}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={ListEmptyComponent}
      onEndReachedThreshold={0.5}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    backgroundColor: COLORS.light,
    flexGrow: 1,
  },
});
