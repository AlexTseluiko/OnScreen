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
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Theme {
  colors: {
    background: string;
    border: string;
    card: string;
    error: string;
    overlay: string;
    primary: string;
    shadow: string;
    text: string;
    textSecondary: string;
    white: string;
  };
}

interface DynamicStyles {
  categoriesContainer: ViewStyle;
  favoriteFilterButtonActive: ViewStyle;
  modalContent: ViewStyle;
}

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

const getDynamicStyles = (theme: Theme): DynamicStyles => ({
  categoriesContainer: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    padding: 16,
  },
  favoriteFilterButtonActive: {
    backgroundColor: theme.colors.error + '20',
    borderRadius: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    elevation: 5,
    maxHeight: 600,
    padding: 20,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 350,
  },
});

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

  const dynamicStyles = getDynamicStyles(theme);

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
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const renderProgram = ({ item }: { item: ScreeningProgram }) => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.programCard, { backgroundColor: theme.colors.card }]}
        onPress={() => setSelectedProgram(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.programHeader}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
            <Ionicons
              name={favoritePrograms.includes(item.id) ? 'heart' : 'heart-outline'}
              size={24}
              color={
                favoritePrograms.includes(item.id) ? theme.colors.error : theme.colors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
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
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {selectedProgram?.title}
            </Text>
            <TouchableOpacity onPress={() => setSelectedProgram(null)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailSection}>
              <Text style={[styles.detailTitle, { color: theme.colors.text }]}>Описание</Text>
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                {selectedProgram?.details}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.detailTitle, { color: theme.colors.text }]}>Факторы риска</Text>
              {selectedProgram?.riskFactors.map((factor, index) => (
                <Text key={index} style={[styles.riskFactor, { color: theme.colors.text }]}>
                  • {factor}
                </Text>
              ))}
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.detailTitle, { color: theme.colors.text }]}>Рекомендации</Text>
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                Возраст: {selectedProgram?.ageRange}
              </Text>
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
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
              <Text style={[styles.scheduleButtonText, { color: theme.colors.background }]}>
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
      <View style={[styles.searchContainer, { borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={t('search.placeholder')}
          placeholderTextColor={theme.colors.textSecondary}
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
            color={showFavorites ? theme.colors.error : theme.colors.textSecondary}
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
                  selectedCategory === category ? theme.colors.primary : theme.colors.card,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                {
                  color: selectedCategory === category ? theme.colors.white : theme.colors.text,
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
                backgroundColor:
                  selectedAge === ageRange ? theme.colors.primary : theme.colors.card,
              },
            ]}
            onPress={() => setSelectedAge(ageRange)}
          >
            <Text
              style={[
                styles.ageRangeButtonText,
                {
                  color: selectedAge === ageRange ? theme.colors.white : theme.colors.text,
                },
              ]}
            >
              {ageRange}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPrograms}
          renderItem={renderProgram}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.programsList}
        />
      )}

      {renderProgramDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  ageRangeButton: {
    borderRadius: 20,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  } as ViewStyle,
  ageRangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  ageRangesContainer: {
    padding: 16,
  } as ViewStyle,
  categoryButton: {
    borderRadius: 20,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  } as ViewStyle,
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  container: {
    flex: 1,
    padding: 16,
  } as ViewStyle,
  description: {
    fontSize: 14,
    marginBottom: 8,
  } as TextStyle,
  detailSection: {
    marginBottom: 20,
  } as ViewStyle,
  detailText: {
    fontSize: 16,
    marginBottom: 4,
  } as TextStyle,
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  } as TextStyle,
  errorText: {
    fontSize: 14,
    margin: 16,
    textAlign: 'center',
  } as TextStyle,
  favoriteFilterButton: {
    marginLeft: 8,
    padding: 8,
  } as ViewStyle,
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  } as ViewStyle,
  modal: {
    alignItems: 'center',
    bottom: 0,
    flex: 1,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  } as ViewStyle,
  modalBody: {
    flex: 1,
  } as ViewStyle,
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  } as ViewStyle,
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  } as TextStyle,
  nextScreeningText: {
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  programCard: {
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  } as ViewStyle,
  programHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  } as ViewStyle,
  programsList: {
    padding: 16,
  } as ViewStyle,
  riskFactor: {
    fontSize: 16,
    marginBottom: 4,
    paddingLeft: 8,
  } as TextStyle,
  scheduleButton: {
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 16,
    padding: 16,
  } as ViewStyle,
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  searchContainer: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 12,
  } as ViewStyle,
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    padding: 8,
  } as TextStyle,
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  } as TextStyle,
});
