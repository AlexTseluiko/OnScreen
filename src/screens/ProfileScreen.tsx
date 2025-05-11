import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';

// Импортируем компоненты из нашей системы атомарного дизайна
import { Text } from '../components/ui/atoms/Text';
import { Avatar } from '../components/ui/atoms/Avatar';
import { IconButton } from '../components/ui/molecules/IconButton';
import { Card } from '../components/ui/molecules/Card';
import { ListItem } from '../components/ui/molecules/ListItem';
import { Icon } from '../components/ui/atoms/Icon';
import { Button } from '../components/ui/atoms/Button';
import styles from './ProfileScreen.styles';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [, setIsEditing] = useState(false);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleViewMedicalCard = () => {
    navigation.navigate('MedicalCard');
  };

  const handleViewSchedule = () => {
    // Временно перенаправляем на Home, пока не создадим экран Schedule
    navigation.navigate('Home');
  };

  const handleViewPatients = () => {
    // Временно перенаправляем на Home, пока не создадим экран Patients
    navigation.navigate('Home');
  };

  const handleViewStatistics = () => {
    // Временно перенаправляем на Home, пока не создадим экран Statistics
    navigation.navigate('Home');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const getRoleTitle = (): string => {
    switch (user?.role) {
      case 'doctor':
        return 'Врач';
      case 'admin':
        return 'Администратор';
      default:
        return 'Пациент';
    }
  };

  // Генерация элементов меню для врача
  const doctorMenuItems = [
    {
      title: 'Расписание приёмов',
      icon: <Icon name="calendar" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: handleViewSchedule,
    },
    {
      title: 'Мои пациенты',
      icon: <Icon name="people" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: handleViewPatients,
    },
    {
      title: 'Статистика',
      icon: <Icon name="stats-chart" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: handleViewStatistics,
    },
    {
      title: 'График работы',
      icon: <Icon name="time" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: 'Отзывы пациентов',
      icon: <Icon name="star" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: 'История консультаций',
      icon: <Icon name="document-text" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: 'Документы и сертификаты',
      icon: <Icon name="folder" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
  ];

  // Генерация элементов меню для пациента
  const patientMenuItems = [
    {
      title: 'Медицинская карта',
      icon: <Icon name="medical" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: handleViewMedicalCard,
    },
    {
      title: 'История посещений',
      icon: <Icon name="time" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: 'Предстоящие записи',
      icon: <Icon name="calendar" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: 'Избранные врачи',
      icon: <Icon name="heart" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: 'Уведомления о приёмах',
      icon: <Icon name="notifications" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
  ];

  // Генерация элементов меню для администратора
  const adminMenuItems = [
    {
      title: 'Статистика системы',
      icon: <Icon name="stats-chart" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: handleViewStatistics,
    },
    {
      title: 'Управление пользователями',
      icon: <Icon name="people" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('AdminUsers'),
    },
    {
      title: 'Заявки врачей',
      icon: <Icon name="document-text" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('DoctorRequests'),
    },
    {
      title: 'Управление клиниками',
      icon: <Icon name="business" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: 'Настройка системы',
      icon: <Icon name="settings" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Settings'),
    },
    {
      title: 'Логи действий',
      icon: <Icon name="list" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: 'Отчеты',
      icon: <Icon name="bar-chart" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
  ];

  // Определение элементов меню на основе роли пользователя
  const getMenuItems = () => {
    switch (user?.role) {
      case 'doctor':
        return doctorMenuItems;
      case 'admin':
        return adminMenuItems;
      default:
        return patientMenuItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar
              size="large"
              name={`${user?.firstName} ${user?.lastName}`}
              source={user?.avatar ? { uri: user.avatar } : undefined}
            />
            <IconButton
              name="camera"
              family="ionicons"
              size="small"
              variant="primary"
              onPress={handleEditProfile}
              containerStyle={styles.editAvatarButton}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text variant="title">{`${user?.firstName} ${user?.lastName}`}</Text>
            <Text variant="subtitle" color={theme.colors.primary}>
              {getRoleTitle()}
            </Text>
            {user?.role === 'doctor' && (
              <Text variant="bodySmall" color={theme.colors.text.secondary}>
                Специальность не указана
              </Text>
            )}
          </View>
        </View>
      </Card>

      <Card title="Действия" containerStyle={styles.actionsCard}>
        <ListItem
          title="Редактировать профиль"
          leftContent={
            <Icon name="create" family="ionicons" size={24} color={theme.colors.primary} />
          }
          onPress={handleEditProfile}
          showDivider
        />

        {menuItems.map((item, index) => (
          <ListItem
            key={index}
            title={item.title}
            leftContent={item.icon}
            onPress={item.onPress}
            showDivider={index !== menuItems.length - 1}
          />
        ))}

        <ListItem
          title="Сменить пароль"
          leftContent={<Icon name="key" family="ionicons" size={24} color={theme.colors.primary} />}
          onPress={handleChangePassword}
        />
      </Card>

      <View style={styles.editButtonContainer}>
        <Button
          title="Редактировать профиль"
          onPress={handleEditProfile}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
