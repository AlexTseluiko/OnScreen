import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../../constants';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface BloodTypePickerProps {
  label: string;
  value: string;
  onChange: (type: string) => void;
}

export const BloodTypePicker: React.FC<BloodTypePickerProps> = ({ label, value, onChange }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectedText}>{value || 'Выберите группу крови'}</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите группу крови</Text>
            {BLOOD_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.option, value === type && styles.selectedOption]}
                onPress={() => {
                  onChange(type);
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.optionText, value === type && styles.selectedOptionText]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginTop: 16,
    padding: 12,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  label: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 4,
  },
  modalContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    maxHeight: '80%',
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  option: {
    borderBottomColor: COLORS.gray,
    borderBottomWidth: 1,
    padding: 12,
  },
  optionText: {
    color: COLORS.text,
    fontSize: 16,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
  },
  selectedOptionText: {
    color: COLORS.white,
  },
  selectedText: {
    color: COLORS.text,
    fontSize: 16,
  },
});
