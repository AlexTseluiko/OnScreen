import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';

export interface ChipInputProps {
  values: string[];
  onChangeValues: (values: string[]) => void;
  placeholder?: string;
  maxHeight?: number;
}

export const ChipInput: React.FC<ChipInputProps> = ({
  values,
  onChangeValues,
  placeholder = 'Добавить',
  maxHeight,
}) => {
  const { theme, isDark } = useTheme();
  const [inputValue, setInputValue] = useState('');

  const handleAddValue = () => {
    if (inputValue.trim() === '') return;

    onChangeValues([...values, inputValue.trim()]);
    setInputValue('');
  };

  const handleRemoveValue = (index: number) => {
    const newValues = [...values];
    newValues.splice(index, 1);
    onChangeValues(newValues);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {values.map((value, index) => (
          <View
            key={index}
            style={[
              styles.chip,
              {
                backgroundColor: isDark ? theme.colors.surface : theme.colors.background,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <Text>{value}</Text>
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveValue(index)}>
              <Ionicons name="close-circle" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              color: isDark ? theme.colors.text.primary : theme.colors.text.primary,
              borderColor: theme.colors.border,
              backgroundColor: isDark ? theme.colors.surface : theme.colors.background,
            },
          ]}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.hint}
          onSubmitEditing={handleAddValue}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddValue}
          disabled={inputValue.trim() === ''}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    marginLeft: 8,
    width: 46,
  },
  chip: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingVertical: 10,
  },
  container: {
    width: '100%',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 46,
    paddingHorizontal: 12,
  },
  inputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  removeButton: {
    paddingLeft: 2,
  },
});
