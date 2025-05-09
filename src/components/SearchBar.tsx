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
    left: 20,
    position: 'absolute',
    right: 20,
    top: 50,
    zIndex: 1,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 15,
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
