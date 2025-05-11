/* eslint-disable react-native/no-unused-styles */
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { Text } from '../components/ui/atoms/Text';
import styles from './HomeScreen.styles';

// Интерфейс для статьи
interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
}

// Мок-данные для статей
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Профилактика сердечно-сосудистых заболеваний',
    summary: 'Как сохранить здоровье сердца на долгие годы',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    title: 'Правильное питание весной',
    summary: 'Важные питательные вещества для поддержания иммунитета',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: '3',
    title: 'Упражнения для домашних тренировок',
    summary: 'Простые упражнения для поддержания тонуса без спортзала',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: '4',
    title: 'Здоровый сон и его влияние на организм',
    summary: 'Почему важно спать не менее 7-8 часов в сутки',
    imageUrl: 'https://via.placeholder.com/150',
  },
];

// Интерфейс для квадрата меню
interface MenuSquare {
  id: string;
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: keyof RootStackParamList;
}

// Данные для главных квадратов
const mainSquares: MenuSquare[] = [
  {
    id: '1',
    title: 'Профиль',
    icon: 'person',
    route: 'Profile',
  },
  {
    id: '2',
    title: 'Онлайн консультация',
    icon: 'videocam',
    route: 'Chat',
  },
  {
    id: '3',
    title: 'Медицинская карта',
    icon: 'document-text',
    route: 'MedicalCard',
  },
  {
    id: '4',
    title: 'Мои заметки',
    icon: 'pencil',
    route: 'Profile', // Временно - нужно создать экран заметок
  },
];

// Дополнительные квадраты для навигации
const additionalSquares: MenuSquare[] = [
  {
    id: '5',
    title: 'Врачи',
    icon: 'medkit',
    route: 'Doctors',
  },
  {
    id: '6',
    title: 'Клиники',
    icon: 'business',
    route: 'Facilities',
  },
  {
    id: '7',
    title: 'Записи',
    icon: 'calendar',
    route: 'UpcomingAppointments',
  },
  {
    id: '8',
    title: 'История',
    icon: 'time',
    route: 'VisitHistory',
  },
  {
    id: '9',
    title: 'Лекарства',
    icon: 'medical',
    route: 'Medications',
  },
  {
    id: '10',
    title: 'Экстренная помощь',
    icon: 'alert-circle',
    route: 'EmergencyAIAssistant',
  },
  {
    id: '11',
    title: 'Скрининг',
    icon: 'fitness',
    route: 'ScreeningPrograms',
  },
  {
    id: '12',
    title: 'Поиск',
    icon: 'search',
    route: 'Search',
  },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isDark } = useTheme();
  const [articles, setArticles] = useState<Article[]>(mockArticles);

  // Загрузка статей при монтировании компонента
  useEffect(() => {
    // Здесь можно добавить API запрос для получения статей
    // Пока используем мок-данные
    setArticles(mockArticles);
  }, []);

  // Навигация к экрану по нажатию на квадрат
  const handleSquarePress = (route: keyof RootStackParamList) => {
    navigation.navigate(route as never);
  };

  // Навигация к экрану статьи
  const handleArticlePress = () => {
    // Добавить навигацию к конкретной статье, когда будет готов экран
    navigation.navigate('Articles');
  };

  // Переход на экран всех статей
  const handleViewAllArticles = () => {
    navigation.navigate('Articles');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Приветствие */}
        <Text style={styles.header}>Доброго дня!</Text>

        {/* 4 основных квадрата */}
        <View style={styles.squaresContainer}>
          {mainSquares.map(square => (
            <TouchableOpacity
              key={square.id}
              style={styles.square}
              onPress={() => handleSquarePress(square.route)}
            >
              <Ionicons
                name={square.icon}
                size={32}
                color={isDark ? COLORS.dark.primary : COLORS.light.primary}
                style={styles.squareIcon}
              />
              <Text style={styles.squareTitle}>{square.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Дополнительные экраны */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Все сервисы</Text>
        </View>

        <View style={styles.additionalSquaresContainer}>
          {additionalSquares.map(square => (
            <TouchableOpacity
              key={square.id}
              style={styles.additionalSquare}
              onPress={() => handleSquarePress(square.route)}
            >
              <Ionicons
                name={square.icon}
                size={24}
                color={isDark ? COLORS.dark.primary : COLORS.light.primary}
                style={styles.squareIcon}
              />
              <Text style={styles.additionalSquareTitle}>{square.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Секция статей */}
        <View style={styles.articlesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Статьи о здоровье</Text>
            <TouchableOpacity onPress={handleViewAllArticles}>
              <Text style={styles.viewAllText}>Смотреть все</Text>
            </TouchableOpacity>
          </View>

          {articles.map(article => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              onPress={() => handleArticlePress()}
            >
              <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />
              <View style={styles.articleContent}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleSummary} numberOfLines={2}>
                  {article.summary}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
