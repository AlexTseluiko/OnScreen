import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChipInputProps {
  values: string[];
  onChangeValues: (values: string[]) => void;
  placeholder?: string;
  theme: any;
}

export const ChipInput: React.FC<ChipInputProps> = ({
  values,
  onChangeValues,
  placeholder = 'Добавить',
  theme,
}) => {
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
      >
        {values.map((value, index) => (
          <View
            key={index}
            style={[
              styles.chip,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.primary },
            ]}
          >
            <Text style={[styles.chipText, { color: theme.colors.text }]}>{value}</Text>
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
              color: theme.colors.text,
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.background,
            },
          ]}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          onSubmitEditing={handleAddValue}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddValue}
          disabled={inputValue.trim() === ''}
        >
          <Ionicons name="add" size={24} color={theme.colors.white} />
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
  chipText: {
    fontSize: 14,
    marginRight: 4,
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
