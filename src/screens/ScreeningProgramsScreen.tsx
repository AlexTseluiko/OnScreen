import React, { useState, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles, { getDynamicStyles } from './ScreeningProgramsScreen.styles';

interface ScreeningProgram {
  id: string;
  title: string;
  description: string;
  details: string;
  riskFactors: string[];
  ageRange: string;
  frequency: string;
  nextScreening?: string;
  category: string;
  tests: ScreeningTest[];
}

interface ScreeningTest {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  preparation: string;
  results: string;
}

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
  const [programs, setPrograms] = useState<ScreeningProgram[]>([]);
  const [favoritePrograms, setFavoritePrograms] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ScreeningProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAge, setSelectedAge] = useState('40-69');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [scaleAnim] = useState(new Animated.Value(1));

  const ageRanges = ['18+', '21-65', '40-69', '45-75', '50-70', '50-75', '55-80'];

  const dynamicStyles = getDynamicStyles({
    colors: {
      background: theme.colors.background,
      border: theme.colors.border || theme.colors.divider,
      card: theme.colors.surface,
      error: theme.colors.danger,
      overlay: theme.colors.overlay,
      primary: theme.colors.primary,
      shadow: theme.colors.shadow,
      text: theme.colors.text.primary,
      textSecondary: theme.colors.text.secondary,
      white: theme.colors.white,
    },
  });

  useEffect(() => {
    loadPrograms();
    loadFavorites();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      // Здесь будет загрузка программ с сервера
      const mockPrograms: ScreeningProgram[] = [
        {
          id: '1',
          title: 'Общий медицинский осмотр',
          description: 'Комплексное обследование организма',
          details: 'Включает осмотр терапевта, анализы крови и мочи',
          riskFactors: ['Возраст старше 40 лет', 'Наследственность'],
          ageRange: '18+',
          frequency: 'Раз в год',
          category: 'Общие',
          tests: [],
        },
        // Добавьте другие программы по необходимости
      ];
      setPrograms(mockPrograms);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

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

  const toggleFavorite = async (programId: string) => {
    try {
      const newFavorites = favoritePrograms.includes(programId)
        ? favoritePrograms.filter(id => id !== programId)
        : [...favoritePrograms, programId];

      setFavoritePrograms(newFavorites);
      await AsyncStorage.setItem('favoritePrograms', JSON.stringify(newFavorites));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении избранного');
    }
  };

  const scheduleNextScreening = (program: ScreeningProgram | null) => {
    if (!program) return;
    console.log('Scheduling next screening for:', program.title);
  };

  const filteredPrograms = programs.filter(program => {
    const matchesAge =
      program.ageRange === selectedAge ||
      (selectedAge === '18+' && parseInt(program.ageRange.split('-')[0]) >= 18) ||
      (selectedAge !== '18+' && program.ageRange === selectedAge);

    const matchesSearch =
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'Все' || program.category === selectedCategory;

    const matchesFavorites = !showFavorites || favoritePrograms.includes(program.id);

    return matchesAge && matchesSearch && matchesCategory && matchesFavorites;
  });

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const renderProgram = ({ item }: { item: ScreeningProgram }) => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.programCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => setSelectedProgram(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.programHeader}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>{item.title}</Text>
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
          {item.description}
        </Text>
        {item.nextScreening && (
          <Text style={[styles.nextScreeningText, { color: theme.colors.primary }]}>
            {t('screening.nextScreening')}: {item.nextScreening}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderProgramDetails = () => (
    <Modal
      visible={selectedProgram !== null}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedProgram(null)}
    >
      <View style={[styles.modal, { backgroundColor: theme.colors.overlay }]}>
        <View style={dynamicStyles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              {selectedProgram?.title}
            </Text>
            <TouchableOpacity onPress={() => setSelectedProgram(null)}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailSection}>
              <Text style={[styles.detailTitle, { color: theme.colors.text.primary }]}>
                Описание
              </Text>
              <Text style={[styles.detailText, { color: theme.colors.text.primary }]}>
                {selectedProgram?.details}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.detailTitle, { color: theme.colors.text.primary }]}>
                Факторы риска
              </Text>
              {selectedProgram?.riskFactors.map((factor, index) => (
                <Text key={index} style={[styles.riskFactor, { color: theme.colors.text.primary }]}>
                  • {factor}
                </Text>
              ))}
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.detailTitle, { color: theme.colors.text.primary }]}>
                Рекомендации
              </Text>
              <Text style={[styles.detailText, { color: theme.colors.text.primary }]}>
                Возраст: {selectedProgram?.ageRange}
              </Text>
              <Text style={[styles.detailText, { color: theme.colors.text.primary }]}>
                Частота: {selectedProgram?.frequency}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.scheduleButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                scheduleNextScreening(selectedProgram);
                setSelectedProgram(null);
              }}
            >
              <Text style={[styles.scheduleButtonText, { color: theme.colors.white }]}>
                Запланировать следующий скрининг
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.searchContainer,
          { borderColor: theme.colors.border || theme.colors.divider },
        ]}
      >
        <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text.primary }]}
          placeholder={t('search.placeholder')}
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
        {categories.map(category => (
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
                backgroundColor:
                  selectedAge === ageRange ? theme.colors.primary : theme.colors.surface,
              },
            ]}
            onPress={() => setSelectedAge(ageRange)}
          >
            <Text
              style={{
                ...styles.ageRangeButtonText,
                color: selectedAge === ageRange ? theme.colors.white : theme.colors.text.primary,
              }}
            >
              {ageRange}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error && <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPrograms}
          keyExtractor={item => item.id}
          renderItem={renderProgram}
          style={styles.programsList}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.errorText, { color: theme.colors.text.secondary }]}>
              {t('screening.noPrograms')}
            </Text>
          }
        />
      )}

      {renderProgramDetails()}
    </View>
  );
};
