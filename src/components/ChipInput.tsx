import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
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
              { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }
            ]}
          >
            <Text style={[styles.chipText, { color: theme.colors.text }]}>
              {value}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveValue(index)}
            >
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
            }
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
  container: {
    width: '100%',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingVertical: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    marginRight: 4,
  },
  removeButton: {
    paddingLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 