import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Animated,
  ActivityIndicator,
  ViewStyle,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleScreening } from '../api/screeningApi';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { ScreeningProgram } from '../types/models';
import { COLORS } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../config/api';

type ScreeningProgramsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ScreeningPrograms'
>;

// Объект с текстами интерфейса на русском, английском и украинском языках
const translations = {
  en: {
    screenTitle: 'Screening Programs',
    search: 'Search programs...',
    noPrograms: 'No programs found',
    loading: 'Loading...',
    schedule: 'Schedule Screening',
    description: 'Description',
    riskFactors: 'Risk Factors',
    recommendations: 'Recommendations',
    frequency: 'Frequency: ',
    recommendedFor: 'Recommended for:',
    benefits: 'Benefits',
    preparation: 'Preparation',
    aftercare: 'Aftercare',
    includedTests: 'Included Tests',
    price: 'Price:',
    duration: 'Duration:',
    testPreparation: 'Preparation:',
    results: 'Results:',
    minutes: 'min.',
    nextScreening: 'Next screening: ',
    errorLoading: 'An error occurred while loading programs',
    success: 'Success',
    scheduledSuccess: 'Screening scheduled successfully',
    error: 'Error',
    scheduleFailed: 'Failed to schedule screening',
    authRequired: 'Authentication Required',
    loginToSchedule: 'You need to log in to schedule a screening',
  },
  ru: {
    screenTitle: 'Программы скрининга',
    search: 'Поиск программ...',
    noPrograms: 'Программы не найдены',
    loading: 'Загрузка...',
    schedule: 'Запланировать скрининг',
    description: 'Описание',
    riskFactors: 'Факторы риска',
    recommendations: 'Рекомендации',
    frequency: 'Частота: ',
    recommendedFor: 'Рекомендуется для:',
    benefits: 'Преимущества',
    preparation: 'Подготовка',
    aftercare: 'Последующий уход',
    includedTests: 'Включенные тесты',
    price: 'Цена:',
    duration: 'Длительность:',
    testPreparation: 'Подготовка:',
    results: 'Результаты:',
    minutes: 'мин.',
    nextScreening: 'Следующий скрининг: ',
    errorLoading: 'Произошла ошибка при загрузке программ скрининга',
    success: 'Успех',
    scheduledSuccess: 'Скрининг запланирован успешно',
    error: 'Ошибка',
    scheduleFailed: 'Не удалось запланировать скрининг',
    authRequired: 'Требуется авторизация',
    loginToSchedule: 'Необходимо войти в систему для записи на скрининг',
  },
  uk: {
    screenTitle: 'Програми скринінгу',
    search: 'Пошук програм...',
    noPrograms: 'Програми не знайдено',
    loading: 'Завантаження...',
    schedule: 'Запланувати скринінг',
    description: 'Опис',
    riskFactors: 'Фактори ризику',
    recommendations: 'Рекомендації',
    frequency: 'Частота: ',
    recommendedFor: 'Рекомендується для:',
    benefits: 'Переваги',
    preparation: 'Підготовка',
    aftercare: 'Подальший догляд',
    includedTests: 'Включені тести',
    price: 'Ціна:',
    duration: 'Тривалість:',
    testPreparation: 'Підготовка:',
    results: 'Результати:',
    minutes: 'хв.',
    nextScreening: 'Наступний скринінг: ',
    errorLoading: 'Сталася помилка при завантаженні програм скринінгу',
    success: 'Успіх',
    scheduledSuccess: 'Скринінг заплановано успішно',
    error: 'Помилка',
    scheduleFailed: 'Не вдалося запланувати скринінг',
    authRequired: 'Потрібна авторизація',
    loginToSchedule: 'Необхідно увійти в систему для запису на скринінг',
  },
};

interface ScreeningTest {
  id: string;
  name: string;
  nameRu: string;
  nameUk: string;
  description: string;
  descriptionRu: string;
  descriptionUk: string;
  price: number;
  duration: number;
  preparation: string;
  preparationRu: string;
  preparationUk: string;
  results: string;
  resultsRu: string;
  resultsUk: string;
}

const categories = [
  'All',
  "Women's Health",
  "Men's Health",
  'General',
  'Respiratory',
  'Skin',
  'Digestive',
  'Cardiovascular',
  'Cancer Prevention',
  'Mental Health',
];

const categoriesRu = [
  'Все',
  'Женское здоровье',
  'Мужское здоровье',
  'Общие',
  'Органы дыхания',
  'Кожа',
  'ЖКТ',
  'Сердечно-сосудистые',
  'Профилактика рака',
  'Психическое здоровье',
];

const categoriesUk = [
  'Всі',
  "Жіноче здоров'я",
  "Чоловіче здоров'я",
  'Загальні',
  'Органи дихання',
  'Шкіра',
  'ШКТ',
  'Серцево-судинні',
  'Профілактика раку',
  "Психічне здоров'я",
];

export const ScreeningProgramsScreen: React.FC = () => {
  const navigation = useNavigation<ScreeningProgramsScreenNavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const [programs, setPrograms] = useState<ScreeningProgram[]>([]);
  const [favoritePrograms, setFavoritePrograms] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ScreeningProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    t('screening.language') === 'ru' ? 'Все' : t('screening.language') === 'uk' ? 'Всі' : 'All'
  );
  const [scaleAnim] = useState(new Animated.Value(1));
  const [activeTestId, setActiveTestId] = useState<string | null>(null);

  const isRussian = t('screening.language') === 'ru';
  const isUkrainian = t('screening.language') === 'uk';

  const displayCategories = isRussian ? categoriesRu : isUkrainian ? categoriesUk : categories;

  const texts = isRussian ? translations.ru : isUkrainian ? translations.uk : translations.en;

  // Динамические стили
  const dynamicStyles = {
    categoriesContainer: {
      borderBottomColor: theme.colors.border || theme.colors.divider,
      borderBottomWidth: 1,
      padding: 8,
    } as ViewStyle,
    favoriteFilterButtonActive: {
      backgroundColor: theme.colors.primary + '20',
      borderRadius: 20,
    } as ViewStyle,
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      paddingVertical: 0,
      paddingHorizontal: 0,
      width: '94%',
      maxWidth: 500,
      maxHeight: '90%',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    } as ViewStyle,
    modalBody: {
      padding: 12,
    } as ViewStyle,
    modalBodyContent: {
      paddingBottom: 20,
    } as ViewStyle,
    detailSectionMargin: {
      marginBottom: 16,
    } as ViewStyle,
    riskFactorStyle: {
      color: theme.colors.text.primary,
      marginBottom: 2,
    } as ViewStyle,
    subtitleWithMargin: {
      color: theme.colors.text.primary,
      marginTop: 12,
    } as ViewStyle,
    bulletPointWithPadding: {
      color: theme.colors.text.primary,
      paddingVertical: 2,
    } as ViewStyle,
    testItemMargin: {
      marginVertical: 6,
    } as ViewStyle,
    testNameWithFlex: {
      color: theme.colors.text.primary,
      flex: 1,
    } as ViewStyle,
    programsListContent: {
      paddingBottom: 80,
    } as ViewStyle,
  };

  const fetchPrograms = async (shouldRefresh: boolean = false) => {
    try {
      if (shouldRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const token = await getToken();
      const response = await apiClient.get(API_ENDPOINTS.SCREENING.PROGRAMS, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: 1,
          limit: 10,
        },
      });

      if (response.data && response.data.programs) {
        setPrograms(response.data.programs);
      } else {
        throw new Error('Failed to load screening programs');
      }
    } catch (err) {
      console.error('Error fetching screening programs:', err);
      setError(t('screening.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrograms();

    // Загрузка списка избранных программ из AsyncStorage
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem('favoritePrograms');
        if (stored) {
          setFavoritePrograms(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Ошибка при загрузке избранных программ:', e);
      }
    };

    loadFavorites();
  }, [fetchPrograms]);

  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem('favoritePrograms', JSON.stringify(favoritePrograms));
      } catch (e) {
        console.error('Ошибка при сохранении избранных программ:', e);
      }
    };

    saveFavorites();
  }, [favoritePrograms]);

  const handleRefresh = () => {
    fetchPrograms(true);
  };

  const handleProgramPress = (program: ScreeningProgram) => {
    navigation.navigate('ScreeningDetails', { programId: program.id });
  };

  const handleSchedulePress = (program: ScreeningProgram) => {
    navigation.navigate('ScreeningSchedule', { programId: program.id });
  };

  const toggleFavorite = (id: string) => {
    setFavoritePrograms(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const scheduleNextScreening = async (program: ScreeningProgram | null) => {
    if (!program) return;

    try {
      // Здесь можно добавить выбор даты через DatePicker
      const date = new Date();
      date.setDate(date.getDate() + 7); // Например, через неделю

      // Получаем ID пользователя из контекста или хранилища
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        // Если пользователь не авторизован, показываем сообщение
        Alert.alert(texts.authRequired, texts.loginToSchedule, [{ text: 'OK' }]);
        return;
      }

      await scheduleScreening(program.id, date.toISOString(), userId);

      // Показываем подтверждение
      Alert.alert(texts.success, texts.scheduledSuccess, [{ text: 'OK' }]);
    } catch (error) {
      console.error('Ошибка при планировании скрининга:', error);
      Alert.alert(texts.error, texts.scheduleFailed, [{ text: 'OK' }]);
    }
  };

  const filteredPrograms = programs.filter(program => {
    // Фильтрация по категории
    const categoryFilter =
      selectedCategory === 'All' || selectedCategory === 'Все' || selectedCategory === 'Всі'
        ? true
        : isRussian
          ? program.categoryRu === selectedCategory
          : isUkrainian
            ? program.categoryUk === selectedCategory
            : program.category === selectedCategory;

    // Фильтрация по поисковому запросу
    const searchFilter = searchQuery
      ? program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.titleRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.titleUk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.descriptionRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.descriptionUk.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    // Фильтрация по избранному
    const favoriteFilter = showFavorites ? favoritePrograms.includes(program.id) : true;

    return categoryFilter && searchFilter && favoriteFilter;
  });

  const renderProgram = ({ item }: { item: ScreeningProgram }) => {
    const getLocalizedText = (en: string, ru: string, uk: string) => {
      if (isRussian) return ru;
      if (isUkrainian) return uk;
      return en;
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.programCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => {
            handleProgramPress(item);
            setSelectedProgram(item);
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View style={styles.programHeader}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              {getLocalizedText(item.title, item.titleRu, item.titleUk)}
            </Text>
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
              <Ionicons
                name={favoritePrograms.includes(item.id) ? 'heart' : 'heart-outline'}
                size={24}
                color={
                  favoritePrograms.includes(item.id)
                    ? theme.colors.danger
                    : theme.colors.text.secondary
                }
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            {getLocalizedText(item.description, item.descriptionRu, item.descriptionUk)}
          </Text>
          <Text
            style={[
              styles.categoryTag,
              { backgroundColor: theme.colors.primary + '20', color: theme.colors.primary },
            ]}
          >
            {getLocalizedText(item.category, item.categoryRu, item.categoryUk)}
          </Text>
          {item.nextScreening && (
            <Text style={[styles.nextScreeningText, { color: theme.colors.primary }]}>
              {texts.nextScreening} {item.nextScreening}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderProgramDetails = () => {
    const getLocalizedText = (en: string, ru: string, uk: string) => {
      if (isRussian) return ru;
      if (isUkrainian) return uk;
      return en;
    };

    const getLocalizedArray = (en: string[], ru: string[], uk: string[]) => {
      if (isRussian) return ru;
      if (isUkrainian) return uk;
      return en;
    };

    return (
      <Modal
        visible={selectedProgram !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedProgram(null)}
      >
        <View style={[styles.modal, { backgroundColor: theme.colors.overlay }]}>
          <View style={dynamicStyles.modalContent}>
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.colors.border || theme.colors.divider },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
                {selectedProgram
                  ? getLocalizedText(
                      selectedProgram.title,
                      selectedProgram.titleRu,
                      selectedProgram.titleUk
                    )
                  : ''}
              </Text>
              <TouchableOpacity onPress={() => setSelectedProgram(null)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={[styles.modalBody, dynamicStyles.modalBody]}
              contentContainerStyle={dynamicStyles.modalBodyContent}
            >
              <View style={[styles.detailSection, dynamicStyles.detailSectionMargin]}>
                <Text style={[styles.detailTitle, { color: theme.colors.text.primary }]}>
                  {texts.description}
                </Text>
                <Text style={[styles.detailText, { color: theme.colors.text.primary }]}>
                  {selectedProgram
                    ? getLocalizedText(
                        selectedProgram.details,
                        selectedProgram.detailsRu,
                        selectedProgram.detailsUk
                      )
                    : ''}
                </Text>
              </View>

              <View style={[styles.detailSection, dynamicStyles.detailSectionMargin]}>
                <Text style={[styles.detailTitle, { color: theme.colors.text.primary }]}>
                  {texts.riskFactors}
                </Text>
                {selectedProgram?.riskFactors.map((factor, index) => (
                  <Text key={index} style={[styles.riskFactor, dynamicStyles.riskFactorStyle]}>
                    •{' '}
                    {selectedProgram &&
                      getLocalizedArray(
                        selectedProgram.riskFactors,
                        selectedProgram.riskFactorsRu,
                        selectedProgram.riskFactorsUk
                      )[index]}
                  </Text>
                ))}
              </View>

              <View style={[styles.detailSection, dynamicStyles.detailSectionMargin]}>
                <Text style={[styles.detailTitle, { color: theme.colors.text.primary }]}>
                  {texts.recommendations}
                </Text>
                <Text style={[styles.detailText, { color: theme.colors.text.primary }]}>
                  {texts.frequency}
                  {selectedProgram
                    ? getLocalizedText(
                        selectedProgram.frequency,
                        selectedProgram.frequencyRu,
                        selectedProgram.frequencyUk
                      )
                    : ''}
                </Text>

                <Text style={[styles.subTitle, dynamicStyles.subtitleWithMargin]}>
                  {texts.recommendedFor}
                </Text>
                {selectedProgram?.recommendedFor.map((item, index) => (
                  <Text
                    key={index}
                    style={[styles.bulletPoint, dynamicStyles.bulletPointWithPadding]}
                  >
                    •{' '}
                    {
                      getLocalizedArray(
                        selectedProgram.recommendedFor,
                        selectedProgram.recommendedForRu,
                        selectedProgram.recommendedForUk
                      )[index]
                    }
                  </Text>
                ))}
              </View>

              <View style={[styles.detailSection, dynamicStyles.detailSectionMargin]}>
                <Text style={[styles.detailTitle, { color: theme.colors.text.primary }]}>
                  {texts.benefits}
                </Text>
                {selectedProgram?.benefits.map((benefit, index) => (
                  <Text
                    key={index}
                    style={[styles.bulletPoint, dynamicStyles.bulletPointWithPadding]}
                  >
                    •{' '}
                    {
                      getLocalizedArray(
                        selectedProgram.benefits,
                        selectedProgram.benefitsRu,
                        selectedProgram.benefitsUk
                      )[index]
                    }
                  </Text>
                ))}
              </View>

              <View style={[styles.detailSection, dynamicStyles.detailSectionMargin]}>
                <Text style={[styles.detailTitle, { color: theme.colors.text.primary }]}>
                  {texts.preparation}
                </Text>
                <Text style={[styles.detailText, { color: theme.colors.text.primary }]}>
                  {selectedProgram
                    ? getLocalizedText(
                        selectedProgram.preparation,
                        selectedProgram.preparationRu,
                        selectedProgram.preparationUk
                      )
                    : ''}
                </Text>
              </View>

              <View style={[styles.detailSection, dynamicStyles.detailSectionMargin]}>
                <Text style={[styles.detailTitle, { color: theme.colors.text.primary }]}>
                  {texts.aftercare}
                </Text>
                <Text style={[styles.detailText, { color: theme.colors.text.primary }]}>
                  {selectedProgram
                    ? getLocalizedText(
                        selectedProgram.aftercare,
                        selectedProgram.aftercareRu,
                        selectedProgram.aftercareUk
                      )
                    : ''}
                </Text>
              </View>

              <View style={[styles.detailSection, dynamicStyles.detailSectionMargin]}>
                <Text style={[styles.detailTitle, { color: theme.colors.text.primary }]}>
                  {texts.includedTests}
                </Text>
                {selectedProgram?.tests.map(test => (
                  <View key={test.id} style={[styles.testItem, dynamicStyles.testItemMargin]}>
                    <TouchableOpacity
                      style={styles.testHeader}
                      onPress={() => setActiveTestId(activeTestId === test.id ? null : test.id)}
                    >
                      <Text style={[styles.testName, dynamicStyles.testNameWithFlex]}>
                        {getLocalizedText(test.name, test.nameRu, test.nameUk)}
                      </Text>
                      <Ionicons
                        name={activeTestId === test.id ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={theme.colors.text.secondary}
                      />
                    </TouchableOpacity>

                    {activeTestId === test.id && (
                      <View style={styles.testDetails}>
                        <Text
                          style={[styles.testDescription, { color: theme.colors.text.primary }]}
                        >
                          {getLocalizedText(
                            test.description,
                            test.descriptionRu,
                            test.descriptionUk
                          )}
                        </Text>
                        <View style={styles.testInfoRow}>
                          <Text
                            style={[styles.testInfoLabel, { color: theme.colors.text.secondary }]}
                          >
                            {texts.price}
                          </Text>
                          <Text
                            style={[styles.testInfoValue, { color: theme.colors.text.primary }]}
                          >
                            {test.price} ₽
                          </Text>
                        </View>
                        <View style={styles.testInfoRow}>
                          <Text
                            style={[styles.testInfoLabel, { color: theme.colors.text.secondary }]}
                          >
                            {texts.duration}
                          </Text>
                          <Text
                            style={[styles.testInfoValue, { color: theme.colors.text.primary }]}
                          >
                            {test.duration} {texts.minutes}
                          </Text>
                        </View>
                        <View style={styles.testInfoRow}>
                          <Text
                            style={[styles.testInfoLabel, { color: theme.colors.text.secondary }]}
                          >
                            {texts.testPreparation}
                          </Text>
                          <Text
                            style={[styles.testInfoValue, { color: theme.colors.text.primary }]}
                          >
                            {getLocalizedText(
                              test.preparation,
                              test.preparationRu,
                              test.preparationUk
                            )}
                          </Text>
                        </View>
                        <View style={styles.testInfoRow}>
                          <Text
                            style={[styles.testInfoLabel, { color: theme.colors.text.secondary }]}
                          >
                            {texts.results}
                          </Text>
                          <Text
                            style={[styles.testInfoValue, { color: theme.colors.text.primary }]}
                          >
                            {getLocalizedText(test.results, test.resultsRu, test.resultsUk)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.scheduleButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  scheduleNextScreening(selectedProgram);
                  setSelectedProgram(null);
                }}
              >
                <Text style={[styles.scheduleButtonText, { color: theme.colors.white }]}>
                  {texts.schedule}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading && !refreshing && programs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('screening.loading')}</Text>
      </View>
    );
  }

  if (error && programs.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.favoriteFilterButton,
          { borderColor: theme.colors.border || theme.colors.divider },
        ]}
      >
        <Ionicons name="heart" size={20} color={theme.colors.text.secondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text.primary }]}
          placeholder={texts.search}
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={[
            styles.favoriteFilterButton,
            showFavorites && dynamicStyles.favoriteFilterButtonActive,
          ]}
          onPress={() => setShowFavorites(!showFavorites)}
        >
          <Ionicons
            name={showFavorites ? 'heart' : 'heart-outline'}
            size={24}
            color={showFavorites ? theme.colors.danger : theme.colors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={dynamicStyles.categoriesContainer}
      >
        {displayCategories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              {
                backgroundColor:
                  selectedCategory === category ? theme.colors.primary : theme.colors.surface,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={{
                ...styles.categoryButtonText,
                color:
                  selectedCategory === category ? theme.colors.white : theme.colors.text.primary,
              }}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredPrograms}
        keyExtractor={item => item.id}
        renderItem={renderProgram}
        style={styles.programsList}
        contentContainerStyle={dynamicStyles.programsListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.errorText, { color: theme.colors.text.secondary }]}>
            {texts.noPrograms}
          </Text>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />

      {renderProgramDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  bulletPoint: {
    color: COLORS.textSecondary,
    fontSize: 14,
    paddingVertical: 2,
  },
  categoryButton: {
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryTag: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  detailTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  favoriteFilterButton: {
    padding: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
  modal: {
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
    flex: 1,
    justifyContent: 'center',
  },
  modalBody: {
    padding: 12,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  nextScreeningText: {
    color: COLORS.primary,
    fontSize: 14,
    marginTop: 8,
  },
  programCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  programHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  programsList: {
    padding: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  riskFactor: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  scheduleButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  scheduleButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  searchInput: {
    flex: 1,
    padding: 12,
  },
  subTitle: {
    color: COLORS.text,
    fontSize: 14,
    marginTop: 12,
  },
  testDescription: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 12,
  },
  testDetails: {
    padding: 12,
  },
  testHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testInfoLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  testInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  testInfoValue: {
    color: COLORS.text,
    fontSize: 14,
  },
  testItem: {
    marginVertical: 6,
  },
  testName: {
    color: COLORS.text,
    flex: 1,
  },
  title: {
    color: COLORS.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
});
