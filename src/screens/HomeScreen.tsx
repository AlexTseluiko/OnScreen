/* eslint-disable react-native/no-unused-styles */
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { Text } from '../components/ui/atoms/Text';
import { useUserRole } from '../contexts/UserRoleContext';
import { articlesApi } from '../api/articlesApi';
import { Article } from '../types/article';
import { clinicsApi } from '../api/clinics';
import { Clinic } from '../types/clinic';
import { useTranslation } from 'react-i18next';

// Интерфейс для статьи
interface MenuSquare {
  id: string;
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: keyof RootStackParamList;
}

// Дополнительные квадраты для навигации - пока не используются в новом дизайне
// const additionalSquares: MenuSquare[] = [
//   {
//     id: '5',
//     title: 'Врачи',
//     icon: 'medkit',
//     route: 'Doctors',
//   },
//   {
//     id: '6',
//     title: 'Клиники',
//     icon: 'business',
//     route: 'Facilities',
//   },
//   {
//     id: '7',
//     title: 'Записи',
//     icon: 'calendar',
//     route: 'UpcomingAppointments',
//   },
//   {
//     id: '8',
//     title: 'История',
//     icon: 'time',
//     route: 'VisitHistory',
//   },
//   {
//     id: '9',
//     title: 'Лекарства',
//     icon: 'medical',
//     route: 'Medications',
//   },
//   {
//     id: '10',
//     title: 'Экстренная помощь',
//     icon: 'alert-circle',
//     route: 'EmergencyAIAssistant',
//   },
//   {
//     id: '11',
//     title: 'Скрининг',
//     icon: 'fitness',
//     route: 'ScreeningPrograms',
//   },
//   {
//     id: '12',
//     title: 'Поиск',
//     icon: 'search',
//     route: 'Search',
//   },
// ];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isDark } = useTheme();
  const { userRole, setUserRole } = useUserRole();
  const [articles, setArticles] = useState<Article[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const { t } = useTranslation();

  // Данные для главных квадратов (для пациента)
  const patientMainSquares: MenuSquare[] = [
    {
      id: '1',
      title: t('home.patientMenu.profile'),
      icon: 'person',
      route: 'Profile',
    },
    {
      id: '2',
      title: t('home.patientMenu.onlineConsultation'),
      icon: 'videocam',
      route: 'Chat',
    },
    {
      id: '3',
      title: t('home.patientMenu.medicalCard'),
      icon: 'document-text',
      route: 'MedicalCard',
    },
    {
      id: '4',
      title: t('home.patientMenu.notes'),
      icon: 'pencil',
      route: 'Profile', // Временно - нужно создать экран заметок
    },
  ];

  // Данные для главных квадратов (для врача)
  const doctorMainSquares: MenuSquare[] = [
    {
      id: '1',
      title: t('home.doctorMenu.profile'),
      icon: 'person',
      route: 'Profile',
    },
    {
      id: '2',
      title: t('home.doctorMenu.consultations'),
      icon: 'videocam',
      route: 'Chat',
    },
    {
      id: '3',
      title: t('home.doctorMenu.patients'),
      icon: 'people',
      route: 'DoctorPatients',
    },
    {
      id: '4',
      title: t('home.doctorMenu.schedule'),
      icon: 'calendar',
      route: 'DoctorSchedule',
    },
  ];

  // Данные для главных квадратов (для администратора)
  const adminMainSquares: MenuSquare[] = [
    {
      id: '1',
      title: t('home.adminMenu.administration'),
      icon: 'settings',
      route: 'Profile',
    },
    {
      id: '2',
      title: t('home.adminMenu.users'),
      icon: 'people',
      route: 'AdminUsers',
    },
    {
      id: '3',
      title: t('home.adminMenu.doctorRequests'),
      icon: 'document-text',
      route: 'DoctorRequests',
    },
    {
      id: '4',
      title: t('home.adminMenu.analytics'),
      icon: 'analytics',
      route: 'ClinicAnalytics',
    },
  ];

  // Получение статей с бэкенда (только первые 3-4)
  useEffect(() => {
    const fetchArticles = async () => {
      setLoadingArticles(true);
      try {
        const response = await articlesApi.getArticles({ page: 1, limit: 4 });
        if (response?.data?.articles) {
          setArticles(response.data.articles);
        } else {
          // Если нет данных в ответе, устанавливаем пустой массив
          setArticles([]);
        }
      } catch (error: unknown) {
        console.error('Ошибка при загрузке статей:', error);
        // При любой ошибке устанавливаем пустой массив статей
        setArticles([]);
      } finally {
        setLoadingArticles(false);
      }
    };
    fetchArticles();
  }, []);

  // Получение клиник с бэкенда
  useEffect(() => {
    const fetchClinics = async () => {
      setLoadingClinics(true);
      try {
        const fetchedClinics = await clinicsApi.getAll({ limit: 10 });
        setClinics(fetchedClinics);
      } catch (error) {
        console.error('Ошибка при загрузке клиник:', error);
        setClinics([]);
      } finally {
        setLoadingClinics(false);
      }
    };
    fetchClinics();
  }, []);

  // Выбор квадратов в зависимости от роли пользователя
  const getMainSquares = (): MenuSquare[] => {
    switch (userRole) {
      case 'doctor':
        return doctorMainSquares;
      case 'admin':
        return adminMainSquares;
      case 'patient':
      default:
        return patientMainSquares;
    }
  };

  // Получаем соответствующие роли квадраты
  const mainSquares = getMainSquares();

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

  // Функции для смены роли (для тестирования)
  const changeToPatient = () => {
    console.log('Смена роли на: patient');
    setUserRole('patient');
    setShowRoleSelector(false);
  };

  const changeToDoctor = () => {
    console.log('Смена роли на: doctor');
    setUserRole('doctor');
    setShowRoleSelector(false);
  };

  const changeToAdmin = () => {
    console.log('Смена роли на: admin');
    setUserRole('admin');
    setShowRoleSelector(false);
  };

  const toggleRoleSelector = () => {
    setShowRoleSelector(!showRoleSelector);
  };

  // Для принудительного обновления навигации
  const reloadApp = () => {
    // В реальном приложении можно использовать RootNavigation.reset() или другой метод
    // Здесь просто закрываем селектор для демонстрации
    console.log('Перезагрузка приложения после смены роли на:', userRole);
    setShowRoleSelector(false);
    // На реальном устройстве можно использовать DevSettings.reload() для полной перезагрузки
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('Используйте reload в Dev Menu для применения новой роли');
    }
  };

  // Заголовок приветствия в зависимости от роли
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return t('home.greeting.morning');
    } else if (hour >= 12 && hour < 18) {
      return t('home.greeting.afternoon');
    } else if (hour >= 18 && hour < 22) {
      return t('home.greeting.evening');
    } else {
      return t('home.greeting.night');
    }
  };

  // Функция для рендеринга панели клиник (только для пациентов и врачей)
  const renderClinicsPanel = () => {
    if (userRole === 'admin') return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.sections.clinics')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Facilities')}>
            <Text style={styles.seeAllText}>{t('home.sections.viewAll')}</Text>
          </TouchableOpacity>
        </View>

        {loadingClinics ? (
          <View style={styles.clinicsPanel}>
            <Text style={styles.clinicsPanelText}>{t('home.sections.loading')}</Text>
          </View>
        ) : clinics.length === 0 ? (
          <View style={styles.clinicsPanel}>
            <Text style={styles.clinicsPanelText}>{t('home.sections.noClinics')}</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.clinicsScrollContainer}
          >
            {clinics.map(clinic => (
              <TouchableOpacity
                key={clinic._id}
                style={styles.clinicCard}
                onPress={() => navigation.navigate('Facilities')}
              >
                <Image
                  source={{
                    uri:
                      clinic.photos && clinic.photos.length > 0
                        ? clinic.photos[0]
                        : 'https://placehold.co/150x100/teal/white?text=Клиника',
                  }}
                  style={styles.clinicImage}
                />
                <View style={styles.clinicContent}>
                  <Text style={styles.clinicName} numberOfLines={1}>
                    {clinic.name}
                  </Text>
                  <View style={styles.clinicRatingContainer}>
                    <Ionicons name="star" size={14} color={COLORS.palette.warning} />
                    <Text style={styles.clinicRating}>{clinic.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.clinicAddress} numberOfLines={1}>
                    {clinic.address.city}, {clinic.address.street}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  // Функция для рендеринга секции статей (только для пациентов)
  const renderArticlesSection = () => {
    if (userRole !== 'patient') return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.sections.articles')}</Text>
          <TouchableOpacity onPress={handleViewAllArticles}>
            <Text style={styles.seeAllText}>{t('home.sections.viewAll')}</Text>
          </TouchableOpacity>
        </View>
        {loadingArticles ? (
          <Text style={styles.articleSummary}>{t('home.sections.loading')}</Text>
        ) : articles.length === 0 ? (
          <Text style={styles.articleSummary}>{t('home.sections.noArticles')}</Text>
        ) : (
          articles.map(article => (
            <TouchableOpacity
              key={article._id}
              style={styles.articleCard}
              onPress={() => handleArticlePress()}
            >
              <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />
              <View style={styles.articleContent}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleSummary} numberOfLines={2}>
                  {article.content?.slice(0, 80) || ''}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };

  // Функция для рендеринга панели статистики (только для врачей и админов)
  const renderStatsPanel = () => {
    if (userRole === 'patient') return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.sections.statistics')}</Text>
        </View>

        <View style={styles.clinicsPanel}>
          <Text style={styles.clinicsPanelText}>
            {userRole === 'doctor' ? t('home.sections.doctorStats') : t('home.sections.adminStats')}
          </Text>
        </View>
      </View>
    );
  };

  // Селектор для выбора ролей (для тестирования)
  const renderRoleSelector = () => {
    if (!showRoleSelector) {
      return (
        <TouchableOpacity style={roleSelectorStyles.floatingButton} onPress={toggleRoleSelector}>
          <Ionicons name="people" size={22} color={COLORS.palette.white} />
        </TouchableOpacity>
      );
    }

    return (
      <View style={roleSelectorStyles.roleSelectorContainer}>
        <TouchableOpacity
          style={[
            roleSelectorStyles.roleButton,
            userRole === 'patient' && roleSelectorStyles.activeRole,
          ]}
          onPress={changeToPatient}
        >
          <Text style={roleSelectorStyles.roleText}>Пациент</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            roleSelectorStyles.roleButton,
            userRole === 'doctor' && roleSelectorStyles.activeRole,
          ]}
          onPress={changeToDoctor}
        >
          <Text style={roleSelectorStyles.roleText}>Врач</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            roleSelectorStyles.roleButton,
            userRole === 'admin' && roleSelectorStyles.activeRole,
          ]}
          onPress={changeToAdmin}
        >
          <Text style={roleSelectorStyles.roleText}>Админ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={roleSelectorStyles.reloadButton} onPress={reloadApp}>
          <Text style={roleSelectorStyles.roleText}>Применить</Text>
        </TouchableOpacity>

        <TouchableOpacity style={roleSelectorStyles.closeButton} onPress={toggleRoleSelector}>
          <Ionicons name="close" size={20} color={COLORS.palette.white} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Верхняя часть с приветствием */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {t('home.username')}
            </Text>
            <Text style={styles.welcomeText}>{t('home.welcomeText')}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            {/* Аватар пользователя */}
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={COLORS.palette.white} />
            </View>
          </TouchableOpacity>
        </View>

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

        {/* Панель клиник (только для пациентов и врачей) */}
        {renderClinicsPanel()}

        {/* Статистика (только для врачей и админов) */}
        {renderStatsPanel()}

        {/* Секция статей (только для пациентов) */}
        {renderArticlesSection()}
      </ScrollView>

      {/* Селектор ролей для тестирования */}
      {renderRoleSelector()}
    </View>
  );
};

// Стили для селектора ролей
const roleSelectorStyles = StyleSheet.create({
  activeRole: {
    backgroundColor: COLORS.palette.primary,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.palette.danger,
    borderRadius: 20,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 5,
    top: 5,
    width: 30,
  },
  floatingButton: {
    alignItems: 'center',
    backgroundColor: COLORS.palette.secondary,
    borderRadius: 30,
    bottom: 20,
    elevation: 5,
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowColor: COLORS.palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    width: 50,
  },
  reloadButton: {
    alignItems: 'center',
    backgroundColor: COLORS.palette.success,
    borderRadius: 8,
    marginVertical: 5,
    padding: 12,
    width: '100%',
  },
  roleButton: {
    alignItems: 'center',
    backgroundColor: COLORS.palette.gray[500],
    borderRadius: 8,
    marginVertical: 5,
    padding: 12,
    width: '100%',
  },
  // eslint-disable-next-line react-native/no-color-literals
  roleSelectorContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 10,
    bottom: 20,
    padding: 10,
    position: 'absolute',
    right: 20,
    width: 150,
  },
  roleText: {
    color: COLORS.palette.white,
    fontWeight: 'bold',
  },
  roleTitle: {
    color: COLORS.palette.white,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  articleCard: {
    backgroundColor: COLORS.palette.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: COLORS.palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  articleContent: {
    padding: 12,
  },
  articleImage: {
    height: 140,
    width: '100%',
  },
  articleSummary: {
    color: COLORS.palette.gray[600],
    fontSize: 14,
    marginTop: 4,
  },
  articleTitle: {
    color: COLORS.palette.gray[900],
    fontSize: 16,
    fontWeight: '600',
  },
  articlesSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    backgroundColor: COLORS.palette.secondary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginLeft: 10,
    width: 40,
  },
  clinicAddress: {
    color: COLORS.palette.gray[600],
    fontSize: 12,
  },
  clinicCard: {
    backgroundColor: COLORS.palette.white,
    borderRadius: 12,
    elevation: 3,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: COLORS.palette.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 180,
  },
  clinicContent: {
    padding: 10,
  },
  clinicImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: 100,
    width: '100%',
  },
  clinicName: {
    color: COLORS.palette.gray[900],
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  clinicRating: {
    color: COLORS.palette.gray[700],
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  clinicRatingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  clinicsPanel: {
    backgroundColor: COLORS.palette.gray[100],
    borderRadius: 12,
    marginBottom: 24,
    marginHorizontal: 16,
    padding: 16,
  },
  clinicsPanelText: {
    color: COLORS.palette.gray[600],
    fontSize: 14,
    textAlign: 'center',
  },
  clinicsScrollContainer: {
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: COLORS.palette.white,
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  greetingContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    paddingBottom: 20,
  },
  roleSwitchButton: {
    alignItems: 'center',
    backgroundColor: COLORS.palette.secondary,
    borderRadius: 30,
    bottom: 20,
    elevation: 5,
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowColor: COLORS.palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    width: 50,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    color: COLORS.palette.primary,
    fontSize: 14,
  },
  square: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: COLORS.palette.gray[100],
    borderRadius: 12,
    elevation: 2,
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: COLORS.palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: '48%',
  },
  squareIcon: {
    marginBottom: 8,
  },
  squareTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  squaresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 24,
  },
});
