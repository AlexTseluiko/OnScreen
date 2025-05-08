import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Расширенные данные для демонстрации
const mockPrograms = [
  {
    id: '1',
    title: 'Скрининг рака молочной железы',
    ageRange: '40-69',
    frequency: 'Раз в 2 года',
    description: 'Маммография для раннего выявления рака молочной железы',
    icon: 'female',
    category: 'Женское здоровье',
    details: 'Маммография - это рентгенологическое исследование молочных желез, которое позволяет выявить рак на ранних стадиях. Рекомендуется проходить женщинам в возрасте 40-69 лет каждые 2 года.',
    riskFactors: ['Возраст старше 40 лет', 'Наследственность', 'Раннее начало менструации', 'Поздняя менопауза'],
    nextScreening: null,
  },
  {
    id: '2',
    title: 'Скрининг рака шейки матки',
    ageRange: '21-65',
    frequency: 'Раз в 3 года',
    description: 'Цитологическое исследование мазка с шейки матки',
    icon: 'medkit',
    category: 'Женское здоровье',
    details: 'Цитологическое исследование (ПАП-тест) позволяет выявить предраковые изменения в клетках шейки матки. Рекомендуется проходить женщинам в возрасте 21-65 лет каждые 3 года.',
    riskFactors: ['Раннее начало половой жизни', 'Множественные половые партнеры', 'Курение', 'ВПЧ-инфекция'],
    nextScreening: null,
  },
  {
    id: '3',
    title: 'Скрининг рака толстой кишки',
    ageRange: '50-75',
    frequency: 'Раз в 10 лет',
    description: 'Колоноскопия для раннего выявления рака толстой кишки',
    icon: 'analytics',
    category: 'ЖКТ',
    details: 'Колоноскопия - это эндоскопическое исследование толстой кишки, которое позволяет выявить полипы и рак на ранних стадиях. Рекомендуется проходить людям в возрасте 50-75 лет каждые 10 лет.',
    riskFactors: ['Возраст старше 50 лет', 'Наследственность', 'Воспалительные заболевания кишечника', 'Неправильное питание'],
    nextScreening: null,
  },
  {
    id: '4',
    title: 'Скрининг рака предстательной железы',
    ageRange: '50-70',
    frequency: 'Раз в 2 года',
    description: 'Анализ крови на ПСА и пальцевое ректальное исследование',
    icon: 'male',
    category: 'Мужское здоровье',
    details: 'Скрининг включает анализ крови на ПСА и пальцевое ректальное исследование. Рекомендуется мужчинам в возрасте 50-70 лет проходить обследование каждые 2 года.',
    riskFactors: ['Возраст старше 50 лет', 'Наследственность', 'Афроамериканское происхождение', 'Ожирение'],
    nextScreening: null,
  },
  {
    id: '5',
    title: 'Скрининг рака легких',
    ageRange: '55-80',
    frequency: 'Раз в год',
    description: 'Низкодозная компьютерная томография легких',
    icon: 'lungs',
    category: 'Органы дыхания',
    details: 'Низкодозная КТ легких позволяет выявить рак на ранних стадиях. Рекомендуется курящим людям в возрасте 55-80 лет проходить обследование ежегодно.',
    riskFactors: ['Курение', 'Возраст старше 55 лет', 'Профессиональные вредности', 'Наследственность'],
    nextScreening: null,
  },
  {
    id: '6',
    title: 'Скрининг рака кожи',
    ageRange: '18+',
    frequency: 'Раз в год',
    description: 'Осмотр кожи у дерматолога',
    icon: 'body',
    category: 'Кожа',
    details: 'Регулярный осмотр кожи позволяет выявить меланому и другие виды рака кожи на ранних стадиях. Рекомендуется всем взрослым проходить осмотр ежегодно.',
    riskFactors: ['Светлая кожа', 'Солнечные ожоги в анамнезе', 'Наследственность', 'Множественные родинки'],
    nextScreening: null,
  },
  {
    id: '7',
    title: 'Скрининг рака желудка',
    ageRange: '45-75',
    frequency: 'Раз в 3 года',
    description: 'Гастроскопия',
    icon: 'restaurant',
    category: 'ЖКТ',
    details: 'Гастроскопия позволяет выявить рак желудка на ранних стадиях. Рекомендуется людям в возрасте 45-75 лет проходить обследование каждые 3 года.',
    riskFactors: ['Возраст старше 45 лет', 'Наследственность', 'Хронический гастрит', 'Инфекция H. pylori'],
    nextScreening: null,
  },
];

const categories = [
  'Все',
  'Женское здоровье',
  'Мужское здоровье',
  'Общие',
  'Органы дыхания',
  'Кожа',
  'ЖКТ',
];

export const ScreeningProgramsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedAge, setSelectedAge] = useState('40-69');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favoritePrograms, setFavoritePrograms] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const ageRanges = ['18+', '21-65', '40-69', '45-75', '50-70', '50-75', '55-80'];

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favoritePrograms');
      if (favorites) {
        setFavoritePrograms(JSON.parse(favorites));
      }
    } catch (error) {
      console.error('Ошибка при загрузке избранного:', error);
    }
  };

  const toggleFavorite = async (programId) => {
    try {
      const newFavorites = favoritePrograms.includes(programId)
        ? favoritePrograms.filter(id => id !== programId)
        : [...favoritePrograms, programId];
      
      await AsyncStorage.setItem('favoritePrograms', JSON.stringify(newFavorites));
      setFavoritePrograms(newFavorites);
    } catch (error) {
      console.error('Ошибка при сохранении избранного:', error);
    }
  };

  const scheduleNextScreening = (program) => {
    const today = new Date();
    let nextDate;
    
    switch (program.frequency) {
      case 'Раз в год':
        nextDate = new Date(today.setFullYear(today.getFullYear() + 1));
        break;
      case 'Раз в 2 года':
        nextDate = new Date(today.setFullYear(today.getFullYear() + 2));
        break;
      case 'Раз в 3 года':
        nextDate = new Date(today.setFullYear(today.getFullYear() + 3));
        break;
      case 'Раз в 10 лет':
        nextDate = new Date(today.setFullYear(today.getFullYear() + 10));
        break;
      default:
        nextDate = new Date(today.setMonth(today.getMonth() + 1));
    }

    Alert.alert(
      'Напоминание установлено',
      `Следующий скрининг запланирован на ${nextDate.toLocaleDateString()}`,
      [{ text: 'OK' }]
    );
  };

  const filteredPrograms = mockPrograms.filter(program => {
    const matchesAge = program.ageRange === selectedAge || 
      (selectedAge === '18+' && parseInt(program.ageRange.split('-')[0]) >= 18) ||
      (selectedAge !== '18+' && program.ageRange === selectedAge);
    
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'Все' || program.category === selectedCategory;

    const matchesFavorites = !showFavorites || favoritePrograms.includes(program.id);

    return matchesAge && matchesSearch && matchesCategory && matchesFavorites;
  });

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const renderProgram = ({ item }) => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.programCard, { backgroundColor: theme.colors.card }]}
        onPress={() => {
          setSelectedProgram(item);
          setShowModal(true);
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.programHeader}>
          <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
          <View style={styles.programInfo}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.category, { color: theme.colors.textSecondary }]}>
              {item.category}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={favoritePrograms.includes(item.id) ? 'heart' : 'heart-outline'}
              size={24}
              color={favoritePrograms.includes(item.id) ? '#FF3B30' : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.description, { color: theme.colors.text }]}>
          {item.description}
        </Text>
        <View style={styles.programFooter}>
          <View>
            <Text style={[styles.ageRange, { color: theme.colors.textSecondary }]}>
              {t('ageRange')}: {item.ageRange}
            </Text>
            <Text style={[styles.frequency, { color: theme.colors.primary }]}>
              {item.frequency}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={() => scheduleNextScreening(item)}
          >
            <Text style={styles.scheduleButtonText}>Запланировать</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderProgramDetails = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {selectedProgram?.title}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.detailSection}>
              <Text style={[styles.detailTitle, { color: theme.colors.text }]}>
                Описание
              </Text>
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                {selectedProgram?.details}
              </Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={[styles.detailTitle, { color: theme.colors.text }]}>
                Факторы риска
              </Text>
              {selectedProgram?.riskFactors.map((factor, index) => (
                <Text key={index} style={[styles.riskFactor, { color: theme.colors.text }]}>
                  • {factor}
                </Text>
              ))}
            </View>
            
            <View style={styles.detailSection}>
              <Text style={[styles.detailTitle, { color: theme.colors.text }]}>
                Рекомендации
              </Text>
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                Возраст: {selectedProgram?.ageRange}
              </Text>
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                Частота: {selectedProgram?.frequency}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.scheduleButton, styles.modalScheduleButton]}
              onPress={() => {
                scheduleNextScreening(selectedProgram);
                setShowModal(false);
              }}
            >
              <Text style={styles.scheduleButtonText}>Запланировать следующий скрининг</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={t('search.placeholder')}
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={[styles.favoriteFilterButton, showFavorites && styles.favoriteFilterButtonActive]}
          onPress={() => setShowFavorites(!showFavorites)}
        >
          <Ionicons
            name={showFavorites ? 'heart' : 'heart-outline'}
            size={24}
            color={showFavorites ? '#FF3B30' : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category
                  ? theme.colors.primary
                  : theme.colors.card,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                {
                  color: selectedCategory === category
                    ? theme.colors.white
                    : theme.colors.text,
                },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.ageRangesContainer}
      >
        {ageRanges.map(ageRange => (
          <TouchableOpacity
            key={ageRange}
            style={[
              styles.ageRangeButton,
              {
                backgroundColor: selectedAge === ageRange
                  ? theme.colors.primary
                  : theme.colors.card,
              },
            ]}
            onPress={() => setSelectedAge(ageRange)}
          >
            <Text
              style={[
                styles.ageRangeButtonText,
                {
                  color: selectedAge === ageRange
                    ? theme.colors.white
                    : theme.colors.text,
                },
              ]}
            >
              {ageRange}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredPrograms}
        renderItem={renderProgram}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.programsList}
      />

      {renderProgramDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    padding: 8,
  },
  favoriteFilterButton: {
    padding: 8,
    marginLeft: 8,
  },
  favoriteFilterButtonActive: {
    backgroundColor: '#FFE5E5',
    borderRadius: 20,
  },
  categoriesContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ageRangesContainer: {
    padding: 16,
  },
  ageRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  ageRangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  programsList: {
    padding: 16,
  },
  programCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  programInfo: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ageRange: {
    fontSize: 12,
    marginBottom: 4,
  },
  frequency: {
    fontSize: 12,
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 8,
  },
  scheduleButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  modalBody: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  riskFactor: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  modalScheduleButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
}); 