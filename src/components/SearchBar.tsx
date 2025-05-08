import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants';

const SearchBar = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={t('search.placeholder')}
        placeholderTextColor="#999"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  input: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
});

export default SearchBar; 