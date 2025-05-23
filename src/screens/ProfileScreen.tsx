import React from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

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
        return t('profile.roles.doctor');
      case 'admin':
        return t('profile.roles.admin');
      default:
        return t('profile.roles.patient');
    }
  };

  // Генерация элементов меню для врача
  const doctorMenuItems = [
    {
      title: t('profile.menu.doctor.schedule'),
      icon: <Icon name="calendar" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: handleViewSchedule,
    },
    {
      title: t('profile.menu.doctor.patients'),
      icon: <Icon name="people" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: handleViewPatients,
    },
    {
      title: t('profile.menu.doctor.statistics'),
      icon: <Icon name="stats-chart" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: handleViewStatistics,
    },
    {
      title: t('profile.menu.doctor.workingHours'),
      icon: <Icon name="time" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: t('profile.menu.doctor.reviews'),
      icon: <Icon name="star" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: t('profile.menu.doctor.consultationHistory'),
      icon: <Icon name="document-text" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: t('profile.menu.doctor.documents'),
      icon: <Icon name="folder" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
  ];

  // Генерация элементов меню для пациента
  const patientMenuItems = [
    {
      title: t('profile.menu.patient.medicalCard'),
      icon: <Icon name="medical" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: handleViewMedicalCard,
    },
    {
      title: t('profile.menu.patient.visitHistory'),
      icon: <Icon name="time" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: t('profile.menu.patient.upcomingAppointments'),
      icon: <Icon name="calendar" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: t('profile.menu.patient.favoriteDoctors'),
      icon: <Icon name="heart" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: t('profile.menu.patient.appointmentReminders'),
      icon: <Icon name="notifications" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
  ];

  // Генерация элементов меню для администратора
  const adminMenuItems = [
    {
      title: t('profile.menu.admin.systemStatistics'),
      icon: <Icon name="stats-chart" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: handleViewStatistics,
    },
    {
      title: t('profile.menu.admin.userManagement'),
      icon: <Icon name="people" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('AdminUsers'),
    },
    {
      title: t('profile.menu.admin.doctorRequests'),
      icon: <Icon name="document-text" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('DoctorRequests'),
    },
    {
      title: t('profile.menu.admin.clinicManagement'),
      icon: <Icon name="business" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: t('profile.menu.admin.systemSettings'),
      icon: <Icon name="settings" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Settings'),
    },
    {
      title: t('profile.menu.admin.actionLogs'),
      icon: <Icon name="list" family="ionicons" size={24} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('Home'),
    },
    {
      title: t('profile.menu.admin.reports'),
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
              style={styles.editAvatarButton}
              onPress={handleEditProfile}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text variant="heading" style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text variant="body" style={styles.userEmail}>
              {user?.email}
            </Text>
            <Text variant="caption" style={styles.userRole}>
              {getRoleTitle()}
            </Text>
          </View>
          <IconButton
            name="pencil"
            family="ionicons"
            size="medium"
            variant="secondary"
            style={styles.editButton}
            onPress={handleEditProfile}
          />
        </View>
      </Card>

      <Card containerStyle={styles.menuCard}>
        <Text variant="subheading" style={styles.menuTitle}>
          {t('profile.title')}
        </Text>
        <View style={styles.menuItems}>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              title={item.title}
              leftContent={item.icon}
              rightContent={
                <Icon
                  name="chevron-forward"
                  family="ionicons"
                  size={18}
                  color={theme.colors.text.secondary}
                />
              }
              onPress={item.onPress}
              containerStyle={styles.menuItem}
            />
          ))}
        </View>
      </Card>

      <Card containerStyle={styles.actionsCard}>
        <Button
          title={t('profile.changePassword')}
          onPress={handleChangePassword}
          variant="outline"
          leftIcon={
            <Icon name="lock-closed" family="ionicons" size={18} color={theme.colors.primary} />
          }
          style={styles.actionButton}
        />
        <Button
          title={t('profile.settings')}
          onPress={() => navigation.navigate('Settings')}
          variant="outline"
          leftIcon={
            <Icon name="settings" family="ionicons" size={18} color={theme.colors.primary} />
          }
          style={styles.actionButton}
        />
      </Card>
    </ScrollView>
  );
};

export default ProfileScreen;
