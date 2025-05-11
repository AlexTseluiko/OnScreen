import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { Input } from '../atoms/Input';
import { Text } from '../atoms/Text';

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (text: string) => void;
  initialValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Поиск...',
  onSearch,
  initialValue = '',
}) => {
  const { isDark } = useTheme();
  const [searchText, setSearchText] = useState(initialValue);

  const handleChangeText = (text: string) => {
    setSearchText(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  const handleClear = () => {
    setSearchText('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <View style={styles.container}>
      <Input
        value={searchText}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
      />
      {searchText.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  clearButton: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 14,
    width: 24,
  },
  clearText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  container: {
    marginBottom: 16,
    position: 'relative',
    width: '100%',
  },
  input: {
    paddingRight: 40,
  },
  inputDark: {
    backgroundColor: '#333333',
  },
  inputLight: {
    backgroundColor: '#F2F2F7',
  },
});
