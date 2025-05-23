import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import {
  ScreeningProgram,
  ScreeningTest,
  getScreeningPrograms,
  createScreeningProgram,
  updateScreeningProgram,
  deleteScreeningProgram,
} from '../api/screeningApi';

// Константы для цветов (в глобальной области видимости)
const OVERLAY_COLOR = 'rgba(0,0,0,0.5)';
const TEXT_WHITE = 'white';
const BORDER_COLOR = '#e0e0e0';
const SAVE_BUTTON_COLOR = '#2196F3';
const BACKGROUND_COLOR = 'white';
const SHADOW_COLOR = '#000';

const AdminScreeningScreen: React.FC = () => {
  const { theme } = useTheme();
  const [programs, setPrograms] = useState<ScreeningProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<Partial<ScreeningProgram> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Загрузка списка программ
  const loadPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPrograms = await getScreeningPrograms();
      setPrograms(fetchedPrograms);
    } catch (error) {
      console.error('Ошибка при загрузке программ:', error);
      setError('Не удалось загрузить программы скрининга');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  // Фильтрация программ по поисковому запросу
  const filteredPrograms = programs.filter(
    program =>
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.titleRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.titleUk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Функция для открытия модального окна для создания новой программы
  const handleCreateProgram = () => {
    setCurrentProgram({
      title: '',
      titleRu: '',
      titleUk: '',
      description: '',
      descriptionRu: '',
      descriptionUk: '',
      details: '',
      detailsRu: '',
      detailsUk: '',
      riskFactors: [],
      riskFactorsRu: [],
      riskFactorsUk: [],
      frequency: '',
      frequencyRu: '',
      frequencyUk: '',
      category: '',
      categoryRu: '',
      categoryUk: '',
      tests: [],
      benefits: [],
      benefitsRu: [],
      benefitsUk: [],
      preparation: '',
      preparationRu: '',
      preparationUk: '',
      aftercare: '',
      aftercareRu: '',
      aftercareUk: '',
      recommendedFor: [],
      recommendedForRu: [],
      recommendedForUk: [],
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  // Функция для открытия модального окна для редактирования программы
  const handleEditProgram = (program: ScreeningProgram) => {
    setCurrentProgram(program);
    setIsEditing(true);
    setModalVisible(true);
  };

  // Функция для удаления программы
  const handleDeleteProgram = (program: ScreeningProgram) => {
    Alert.alert(
      'Удаление программы',
      `Вы уверены, что хотите удалить программу "${program.title}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScreeningProgram(program.id);
              setPrograms(prev => prev.filter(p => p.id !== program.id));
              Alert.alert('Успех', 'Программа успешно удалена');
            } catch (error) {
              console.error('Ошибка при удалении программы:', error);
              Alert.alert('Ошибка', 'Не удалось удалить программу');
            }
          },
        },
      ]
    );
  };

  // Функция для сохранения новой или обновления существующей программы
  const handleSaveProgram = async () => {
    if (!currentProgram) return;

    // Проверка обязательных полей
    if (!currentProgram.title || !currentProgram.titleRu || !currentProgram.titleUk) {
      Alert.alert('Ошибка', 'Заполните название программы на всех языках');
      return;
    }

    try {
      let savedProgram: ScreeningProgram;
      if (isEditing && currentProgram.id) {
        // Обновление существующей программы
        savedProgram = await updateScreeningProgram(currentProgram.id, currentProgram);
        setPrograms(prev => prev.map(p => (p.id === savedProgram.id ? savedProgram : p)));
        Alert.alert('Успех', 'Программа успешно обновлена');
      } else {
        // Создание новой программы
        savedProgram = await createScreeningProgram(currentProgram as Omit<ScreeningProgram, 'id'>);
        setPrograms(prev => [...prev, savedProgram]);
        Alert.alert('Успех', 'Программа успешно создана');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Ошибка при сохранении программы:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить программу');
    }
  };

  // Функция для обновления значения поля в текущей программе
  const handleUpdateField = (field: string, value: string | string[] | ScreeningTest[]) => {
    if (currentProgram) {
      setCurrentProgram({ ...currentProgram, [field]: value });
    }
  };

  // Рендер элемента списка программ
  const renderProgramItem = ({ item }: { item: ScreeningProgram }) => (
    <View style={[styles.programItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.programHeader}>
        <Text style={[styles.programTitle, { color: theme.colors.text.primary }]}>
          {item.title} / {item.titleRu} / {item.titleUk}
        </Text>
        <Text style={[styles.programCategory, { color: theme.colors.primary }]}>
          {item.category} / {item.categoryRu} / {item.categoryUk}
        </Text>
      </View>
      <View style={styles.programActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleEditProgram(item)}
        >
          <Ionicons name="create-outline" size={20} color="white" />
          <Text style={styles.actionButtonText}>Редактировать</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.danger }]}
          onPress={() => handleDeleteProgram(item)}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
          <Text style={styles.actionButtonText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Рендер модального окна для создания/редактирования программы
  const renderProgramModal = () => (
    <Modal visible={modalVisible} animationType="slide" transparent>
      <View style={[styles.modalContainer, { backgroundColor: OVERLAY_COLOR }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              {isEditing ? 'Редактирование программы' : 'Создание программы'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text.primary }]}>
              Название (EN)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border || theme.colors.divider,
                },
              ]}
              value={currentProgram?.title || ''}
              onChangeText={text => handleUpdateField('title', text)}
              placeholder="Введите название на английском"
              placeholderTextColor={theme.colors.text.secondary}
            />

            <Text style={[styles.fieldLabel, { color: theme.colors.text.primary }]}>
              Название (RU)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border || theme.colors.divider,
                },
              ]}
              value={currentProgram?.titleRu || ''}
              onChangeText={text => handleUpdateField('titleRu', text)}
              placeholder="Введите название на русском"
              placeholderTextColor={theme.colors.text.secondary}
            />

            <Text style={[styles.fieldLabel, { color: theme.colors.text.primary }]}>
              Название (UK)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border || theme.colors.divider,
                },
              ]}
              value={currentProgram?.titleUk || ''}
              onChangeText={text => handleUpdateField('titleUk', text)}
              placeholder="Введите название на украинском"
              placeholderTextColor={theme.colors.text.secondary}
            />

            {/* Здесь можно добавить остальные поля формы */}
            <Text style={[styles.fieldLabel, { color: theme.colors.text.primary }]}>
              Категория (EN)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border || theme.colors.divider,
                },
              ]}
              value={currentProgram?.category || ''}
              onChangeText={text => handleUpdateField('category', text)}
              placeholder="Введите категорию на английском"
              placeholderTextColor={theme.colors.text.secondary}
            />

            <Text style={[styles.fieldLabel, { color: theme.colors.text.primary }]}>
              Категория (RU)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border || theme.colors.divider,
                },
              ]}
              value={currentProgram?.categoryRu || ''}
              onChangeText={text => handleUpdateField('categoryRu', text)}
              placeholder="Введите категорию на русском"
              placeholderTextColor={theme.colors.text.secondary}
            />

            <Text style={[styles.fieldLabel, { color: theme.colors.text.primary }]}>
              Категория (UK)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border || theme.colors.divider,
                },
              ]}
              value={currentProgram?.categoryUk || ''}
              onChangeText={text => handleUpdateField('categoryUk', text)}
              placeholder="Введите категорию на украинском"
              placeholderTextColor={theme.colors.text.secondary}
            />

            {/* Кнопка сохранения */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSaveProgram}
            >
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Управление программами скрининга
        </Text>
      </View>

      <View
        style={[
          styles.searchContainer,
          { borderColor: theme.colors.border || theme.colors.divider },
        ]}
      >
        <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text.primary }]}
          placeholder="Поиск программ..."
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleCreateProgram}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Добавить программу</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: theme.colors.primary }]}
            onPress={loadPrograms}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.primary }]}>Повторить</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPrograms}
          keyExtractor={item => item.id}
          renderItem={renderProgramItem}
          contentContainerStyle={styles.programsList}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
              {searchQuery
                ? 'Программы не найдены. Измените параметры поиска.'
                : 'Нет доступных программ скрининга. Создайте новую программу.'}
            </Text>
          }
        />
      )}

      {renderProgramModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 4,
    flexDirection: 'row',
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    color: TEXT_WHITE,
    fontSize: 14,
    marginLeft: 4,
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 12,
  },
  addButtonText: {
    color: TEXT_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 40,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  modalBody: {
    padding: 16,
  },
  modalContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 8,
    elevation: 5,
    maxHeight: '80%',
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '90%',
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: BORDER_COLOR,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  programActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  programCategory: {
    fontSize: 14,
    fontWeight: '500',
  },
  programHeader: {
    marginBottom: 12,
  },
  programItem: {
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 8,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  programsList: {
    paddingBottom: 20,
  },
  retryButton: {
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: SAVE_BUTTON_COLOR,
    borderRadius: 8,
    marginBottom: 24,
    marginTop: 16,
    padding: 16,
  },
  saveButtonText: {
    color: TEXT_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    alignItems: 'center',
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 12,
  },
});

export default AdminScreeningScreen;
