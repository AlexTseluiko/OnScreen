import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';

interface MedicalInfoSectionProps {
  birthDate: string;
  bloodType: string;
  medicalHistory: string;
  allergies: string;
  chronicConditions: string[];
  medications: string[];
  onBirthDateChange: (text: string) => void;
  onBloodTypeChange: (text: string) => void;
  onMedicalHistoryChange: (text: string) => void;
  onAllergiesChange: (text: string) => void;
  onAddChronicCondition: () => void;
  onRemoveChronicCondition: (index: number) => void;
  onAddMedication: () => void;
  onRemoveMedication: (index: number) => void;
  theme: any;
}

export const MedicalInfoSection: React.FC<MedicalInfoSectionProps> = ({
  birthDate,
  bloodType,
  medicalHistory,
  allergies,
  chronicConditions,
  medications,
  onBirthDateChange,
  onBloodTypeChange,
  onMedicalHistoryChange,
  onAllergiesChange,
  onAddChronicCondition,
  onRemoveChronicCondition,
  onAddMedication,
  onRemoveMedication,
  theme,
}) => {
  const { t } = useTranslation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);
  const [tempBloodType, setTempBloodType] = useState(bloodType);
  const [tempDate, setTempDate] = useState(birthDate ? new Date(birthDate) : new Date());

  // Список групп крови
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Форматируем дату для отображения
  const formatDate = (date: string) => {
    if (!date) return '';

    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';

      return d.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Обработчик выбора даты
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setTempDate(selectedDate);

      if (Platform.OS === 'android') {
        // На Android сразу сохраняем дату
        const formattedDate = selectedDate.toISOString().split('T')[0]; // Формат YYYY-MM-DD
        onBirthDateChange(formattedDate);
      }
    }
  };

  // Подтверждение выбора даты (для iOS)
  const confirmDateSelection = () => {
    setShowDatePicker(false);
    const formattedDate = tempDate.toISOString().split('T')[0]; // Формат YYYY-MM-DD
    onBirthDateChange(formattedDate);
  };

  // Подтверждение выбора группы крови
  const confirmBloodTypeSelection = () => {
    setShowBloodTypePicker(false);
    onBloodTypeChange(tempBloodType);
  };

  // Отмена выбора группы крови
  const cancelBloodTypeSelection = () => {
    setShowBloodTypePicker(false);
    setTempBloodType(bloodType); // Сбрасываем на предыдущее значение
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t('medicalInfoSection.title')}
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {t('medicalInfoSection.birthDate')}
        </Text>
        <TouchableOpacity
          style={[styles.input, { borderColor: theme.colors.disabled }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text
            style={[
              styles.inputText,
              !birthDate ? { color: theme.colors.textSecondary } : { color: theme.colors.text },
            ]}
          >
            {formatDate(birthDate) || t('medicalInfoSection.selectBirthDate')}
          </Text>
          <Ionicons name="calendar" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {Platform.OS === 'web' ? (
          <Modal
            transparent={true}
            visible={showDatePicker}
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.pickerHeader, { borderBottomColor: theme.colors.disabled }]}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>
                    {t('medicalInfoSection.selectBirthDate')}
                  </Text>
                  <TouchableOpacity onPress={confirmDateSelection}>
                    <Text style={[styles.doneText, { color: theme.colors.primary }]}>
                      {t('common.done')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.webDatePickerContainer}>
                  <input
                    type="date"
                    value={tempDate.toISOString().split('T')[0]}
                    onChange={e => {
                      const newDate = new Date(e.target.value);
                      if (!isNaN(newDate.getTime())) {
                        setTempDate(newDate);
                      }
                    }}
                    style={{
                      fontSize: 16,
                      padding: 10,
                      width: '100%',
                      borderRadius: 8,
                      border: `1px solid ${theme.colors.disabled}`,
                      color: theme.colors.text,
                      backgroundColor: theme.colors.background,
                    }}
                  />
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          showDatePicker && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()} // Ограничение: не позднее текущей даты
              // На iOS добавляем кнопки для подтверждения/отмены
              {...(Platform.OS === 'ios'
                ? {
                    onConfirm: confirmDateSelection,
                    onCancel: () => setShowDatePicker(false),
                  }
                : {})}
            />
          )
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {t('medicalInfoSection.bloodType')}
        </Text>
        <TouchableOpacity
          style={[styles.input, { borderColor: theme.colors.disabled }]}
          onPress={() => setShowBloodTypePicker(true)}
        >
          <Text
            style={[
              styles.inputText,
              !bloodType ? { color: theme.colors.textSecondary } : { color: theme.colors.text },
            ]}
          >
            {bloodType || t('medicalInfoSection.selectBloodType')}
          </Text>
          <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <Modal
          transparent={true}
          visible={showBloodTypePicker}
          animationType="slide"
          onRequestClose={cancelBloodTypeSelection}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.pickerHeader, { borderBottomColor: theme.colors.disabled }]}>
                <TouchableOpacity onPress={cancelBloodTypeSelection}>
                  <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>
                  {t('medicalInfoSection.selectBloodType')}
                </Text>
                <TouchableOpacity onPress={confirmBloodTypeSelection}>
                  <Text style={[styles.doneText, { color: theme.colors.primary }]}>
                    {t('common.done')}
                  </Text>
                </TouchableOpacity>
              </View>
              {Platform.OS === 'web' ? (
                <View style={styles.webPickerContainer}>
                  {bloodTypes.map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.webPickerItem,
                        tempBloodType === type && styles.webPickerItemSelected,
                        { borderColor: theme.colors.disabled },
                      ]}
                      onPress={() => setTempBloodType(type)}
                    >
                      <Text
                        style={{
                          color: tempBloodType === type ? theme.colors.primary : theme.colors.text,
                          fontWeight: tempBloodType === type ? 'bold' : 'normal',
                        }}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Picker
                  selectedValue={tempBloodType}
                  onValueChange={itemValue => setTempBloodType(itemValue)}
                  itemStyle={{ color: theme.colors.text }}
                >
                  <Picker.Item label={t('medicalInfoSection.selectBloodType')} value="" />
                  {bloodTypes.map(type => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              )}
            </View>
          </View>
        </Modal>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {t('medicalInfoSection.medicalHistory')}
        </Text>
        <TextInput
          style={[
            styles.textArea,
            { color: theme.colors.text, borderColor: theme.colors.disabled },
          ]}
          value={medicalHistory}
          onChangeText={onMedicalHistoryChange}
          placeholder={t('medicalInfoSection.enterMedicalHistory')}
          multiline
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {t('medicalInfoSection.allergies')}
        </Text>
        <TextInput
          style={[
            styles.textArea,
            { color: theme.colors.text, borderColor: theme.colors.disabled },
          ]}
          value={allergies}
          onChangeText={onAllergiesChange}
          placeholder={t('medicalInfoSection.enterAllergies')}
          multiline
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.colors.text }]}>
            {t('medicalInfoSection.chronicConditions')}
          </Text>
          <TouchableOpacity onPress={onAddChronicCondition} style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        {chronicConditions.length > 0 ? (
          <View style={styles.listItems}>
            {chronicConditions.map((condition, index) => (
              <View key={index} style={[styles.listItem, { borderColor: theme.colors.disabled }]}>
                <Text style={{ color: theme.colors.text }}>{condition}</Text>
                <TouchableOpacity onPress={() => onRemoveChronicCondition(index)}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {t('medicalInfoSection.noChronicConditions')}
          </Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Принимаемые лекарства
        </Text>
        <ScrollView style={styles.listContainer}>
          {medications.map((medication, index) => (
            <View
              key={index}
              style={[styles.listItem, { borderBottomColor: theme.colors.disabled }]}
            >
              <Text style={[styles.listItemText, { color: theme.colors.text }]}>{medication}</Text>
              <Text
                style={[styles.removeButton, { color: COLORS.emergency }]}
                onPress={() => onRemoveMedication(index)}
              >
                ✕
              </Text>
            </View>
          ))}
        </ScrollView>
        <Text style={[styles.addButton, { color: theme.colors.primary }]} onPress={onAddMedication}>
          + Добавить лекарство
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    color: COLORS.primary,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  cancelText: {
    color: COLORS.gray,
    fontSize: 16,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doneText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  input: {
    alignItems: 'center',
    borderColor: COLORS.gray,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.text,
    flexDirection: 'row',
    fontSize: 16,
    justifyContent: 'space-between',
    padding: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputText: {
    color: COLORS.text,
    fontSize: 16,
  },
  label: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 4,
  },
  listContainer: {
    maxHeight: 150,
  },
  listHeader: {
    alignItems: 'center',
    borderBottomColor: COLORS.gray,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  listItem: {
    alignItems: 'center',
    borderBottomColor: COLORS.gray,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  listItemText: {
    color: COLORS.text,
    fontSize: 16,
  },
  listItems: {
    padding: 8,
  },
  listTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
  },
  pickerHeader: {
    alignItems: 'center',
    borderBottomColor: COLORS.gray,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  pickerTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: COLORS.gray,
  },
  removeButton: {
    color: COLORS.emergency,
    fontSize: 18,
    padding: 4,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  webDatePickerContainer: {
    padding: 15,
  },
  webPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 15,
  },
  webPickerItem: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    margin: 5,
    minWidth: 70,
    padding: 10,
  },
  webPickerItemSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: COLORS.primary,
  },
});
