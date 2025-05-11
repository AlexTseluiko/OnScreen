import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../theme/colors';
import { Text } from '../components/ui/atoms/Text';
import {
  medicationsApi,
  CreateMedicationRequest,
  MedicationFormType,
  MedicationFrequency,
  MedicationStatus,
} from '../api/medications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '../utils/dateUtils';
import { Picker } from '@react-native-picker/picker';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type AddMedicationNavigationProp = StackNavigationProp<RootStackParamList, 'AddMedication'>;

export const AddMedicationScreen: React.FC = () => {
  const navigation = useNavigation<AddMedicationNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);

  // Состояние полей формы
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicationFormType>(MedicationFormType.TABLET);
  const [frequency, setFrequency] = useState<MedicationFrequency>(MedicationFrequency.DAILY);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(-1);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Добавление времени
  const handleAddTime = () => {
    setTimes([...times, '12:00']);
  };

  // Удаление времени
  const handleRemoveTime = (index: number) => {
    const newTimes = [...times];
    newTimes.splice(index, 1);
    setTimes(newTimes);
  };

  // Редактирование времени
  const handleEditTime = (index: number) => {
    setCurrentTimeIndex(index);
    setShowTimePicker(true);
  };

  // Обработка изменения времени
  const handleTimeChange = (event: DateTimePickerEvent, selectedTime: Date | undefined) => {
    setShowTimePicker(false);
    if (selectedTime && currentTimeIndex >= 0) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      const newTimes = [...times];
      newTimes[currentTimeIndex] = timeString;
      setTimes(newTimes);
    }
  };

  // Обработка изменения даты начала приема
  const handleStartDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  // Обработка изменения даты окончания приема
  const handleEndDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Форматирование даты в строку YYYY-MM-DD
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Валидация формы
  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Укажите название лекарства');
      return false;
    }

    if (!dosage.trim()) {
      Alert.alert('Ошибка', 'Укажите дозировку лекарства');
      return false;
    }

    if (times.length === 0) {
      Alert.alert('Ошибка', 'Добавьте хотя бы одно время приема');
      return false;
    }

    if (hasEndDate && endDate && endDate < startDate) {
      Alert.alert('Ошибка', 'Дата окончания приема не может быть раньше даты начала');
      return false;
    }

    return true;
  };

  // Сохранение лекарства
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const medicationData: CreateMedicationRequest = {
      name,
      dosage,
      form,
      frequency,
      times,
      startDate: formatDateToString(startDate),
      endDate: hasEndDate && endDate ? formatDateToString(endDate) : undefined,
      instructions: instructions.trim() || undefined,
      notes: notes.trim() || undefined,
      status: MedicationStatus.ACTIVE,
      prescribedBy: prescribedBy.trim() || undefined,
      reminderEnabled,
    };

    try {
      const result = await medicationsApi.createMedication(medicationData);
      Alert.alert('Успех', 'Лекарство успешно добавлено', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Medications'),
        },
      ]);
    } catch (error) {
      console.error('Error creating medication:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить лекарство. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMedicationFormOptions = () => {
    return Object.values(MedicationFormType).map(formType => {
      let label;
      switch (formType) {
        case MedicationFormType.TABLET:
          label = 'Таблетки';
          break;
        case MedicationFormType.CAPSULE:
          label = 'Капсулы';
          break;
        case MedicationFormType.LIQUID:
          label = 'Жидкость';
          break;
        case MedicationFormType.INJECTION:
          label = 'Инъекции';
          break;
        case MedicationFormType.CREAM:
          label = 'Крем/мазь';
          break;
        case MedicationFormType.DROPS:
          label = 'Капли';
          break;
        case MedicationFormType.INHALER:
          label = 'Ингалятор';
          break;
        case MedicationFormType.PATCH:
          label = 'Пластырь';
          break;
        case MedicationFormType.POWDER:
          label = 'Порошок';
          break;
        case MedicationFormType.OTHER:
          label = 'Другое';
          break;
      }
      return <Picker.Item key={formType} label={label} value={formType} />;
    });
  };

  const renderMedicationFrequencyOptions = () => {
    return Object.values(MedicationFrequency).map(frequencyType => {
      let label;
      switch (frequencyType) {
        case MedicationFrequency.ONCE:
          label = 'Однократно';
          break;
        case MedicationFrequency.DAILY:
          label = 'Ежедневно';
          break;
        case MedicationFrequency.TWICE_DAILY:
          label = 'Дважды в день';
          break;
        case MedicationFrequency.THREE_TIMES_DAILY:
          label = 'Трижды в день';
          break;
        case MedicationFrequency.FOUR_TIMES_DAILY:
          label = 'Четыре раза в день';
          break;
        case MedicationFrequency.WEEKLY:
          label = 'Еженедельно';
          break;
        case MedicationFrequency.MONTHLY:
          label = 'Ежемесячно';
          break;
        case MedicationFrequency.AS_NEEDED:
          label = 'По необходимости';
          break;
        case MedicationFrequency.CUSTOM:
          label = 'Индивидуальный график';
          break;
      }
      return <Picker.Item key={frequencyType} label={label} value={frequencyType} />;
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Добавление нового лекарства</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Название лекарства *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Введите название лекарства"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Дозировка *</Text>
        <TextInput
          style={styles.input}
          value={dosage}
          onChangeText={setDosage}
          placeholder="Например: 10 мг, 1 таблетка"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Форма лекарства</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form}
            onValueChange={itemValue => setForm(itemValue as MedicationFormType)}
            style={styles.picker}
          >
            {renderMedicationFormOptions()}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Частота приема</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={frequency}
            onValueChange={itemValue => setFrequency(itemValue as MedicationFrequency)}
            style={styles.picker}
          >
            {renderMedicationFrequencyOptions()}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Дата начала приема</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text>{formatDate(startDate.toISOString())}</Text>
          <Ionicons name="calendar" size={20} color={COLORS.light.primary} />
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Задать дату окончания приема</Text>
          <Switch
            value={hasEndDate}
            onValueChange={setHasEndDate}
            thumbColor={hasEndDate ? COLORS.light.primary : '#f4f3f4'}
            trackColor={{ false: '#767577', true: COLORS.light.primary }}
          />
        </View>
        {hasEndDate && (
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text>{endDate ? formatDate(endDate.toISOString()) : 'Выберите дату'}</Text>
            <Ionicons name="calendar" size={20} color={COLORS.light.primary} />
          </TouchableOpacity>
        )}
        {showEndDatePicker && hasEndDate && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Время приема</Text>
        {times.map((time, index) => (
          <View key={index} style={styles.timeItem}>
            <Text style={styles.timeText}>{time}</Text>
            <View style={styles.timeActions}>
              <TouchableOpacity
                style={styles.timeActionButton}
                onPress={() => handleEditTime(index)}
              >
                <Ionicons name="create-outline" size={20} color={COLORS.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeActionButton}
                onPress={() => handleRemoveTime(index)}
                disabled={times.length === 1}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={times.length === 1 ? COLORS.light.text.disabled : COLORS.light.danger}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={handleAddTime}>
          <Ionicons name="add" size={20} color={COLORS.light.background} />
          <Text style={styles.addButtonText}>Добавить время</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={
              currentTimeIndex >= 0 && times[currentTimeIndex]
                ? (() => {
                    const [hours, minutes] = times[currentTimeIndex].split(':').map(Number);
                    const date = new Date();
                    date.setHours(hours, minutes, 0);
                    return date;
                  })()
                : new Date()
            }
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Инструкции по приему</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Добавьте инструкции по приему"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Заметки</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Добавьте дополнительные заметки"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Назначил</Text>
        <TextInput
          style={styles.input}
          value={prescribedBy}
          onChangeText={setPrescribedBy}
          placeholder="Имя врача или клиника"
        />
      </View>

      <View style={styles.formGroup}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Напоминания</Text>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            thumbColor={reminderEnabled ? COLORS.light.primary : '#f4f3f4'}
            trackColor={{ false: '#767577', true: COLORS.light.primary }}
          />
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.light.background} />
          ) : (
            <Text style={styles.saveButtonText}>Сохранить</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: COLORS.light.background,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.surface,
    borderColor: COLORS.light.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: COLORS.light.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  datePickerButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.surface,
    borderColor: COLORS.light.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.light.surface,
    borderColor: COLORS.light.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  label: {
    color: COLORS.light.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerContainer: {
    backgroundColor: COLORS.light.surface,
    borderColor: COLORS.light.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  saveButtonText: {
    color: COLORS.light.background,
    fontSize: 16,
    fontWeight: '500',
  },
  switchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeActionButton: {
    padding: 4,
  },
  timeActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  timeItem: {
    alignItems: 'center',
    backgroundColor: COLORS.light.surface,
    borderColor: COLORS.light.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  timeText: {
    color: COLORS.light.text.primary,
    fontSize: 16,
  },
  title: {
    color: COLORS.light.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default AddMedicationScreen;
