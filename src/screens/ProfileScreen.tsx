import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [, setIsEditing] = useState(false);

  const handleEditProfile = () => {
    setIsEditing(true);
    // Здесь будет логика редактирования профиля
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

  const renderDoctorActions = () => (
    <>
      <TouchableOpacity style={styles.actionButton} onPress={handleViewSchedule}>
        <Ionicons name="calendar" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Расписание приёмов</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={handleViewPatients}>
        <Ionicons name="people" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Мои пациенты</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={handleViewStatistics}>
        <Ionicons name="stats-chart" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Статистика</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="time" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>График работы</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="star" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Отзывы пациентов</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="document-text" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>История консультаций</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="folder" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Документы и сертификаты</Text>
      </TouchableOpacity>
    </>
  );

  const renderPatientActions = () => (
    <>
      <TouchableOpacity style={styles.actionButton} onPress={handleViewMedicalCard}>
        <Ionicons name="medical" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Медицинская карта</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="time" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>История посещений</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="calendar" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Предстоящие записи</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="heart" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Избранные врачи</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('Notifications')}
      >
        <Ionicons name="notifications" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Уведомления о приёмах</Text>
      </TouchableOpacity>
    </>
  );

  const renderAdminActions = () => (
    <>
      <TouchableOpacity style={styles.actionButton} onPress={handleViewStatistics}>
        <Ionicons name="stats-chart" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Статистика системы</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('AdminUsers')}
      >
        <Ionicons name="people" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Управление пользователями</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('DoctorRequests')}
      >
        <Ionicons name="document-text" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Заявки врачей</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="business" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Управление клиниками</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Settings')}>
        <Ionicons name="settings" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Настройка системы</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="list" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Логи действий</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="bar-chart" size={24} color={COLORS.light.primary} />
        <Text style={styles.actionButtonText}>Отчеты</Text>
      </TouchableOpacity>
    </>
  );

  const renderRoleSpecificActions = () => {
    switch (user?.role) {
      case 'DOCTOR':
        return renderDoctorActions();
      case 'ADMIN':
        return renderAdminActions();
      default:
        return renderPatientActions();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user?.avatar || require('../assets/images/default-avatar.png') }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
            <Ionicons name="camera" size={20} color={COLORS.light.whiteBackground} />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{`${user?.firstName} ${user?.lastName}`}</Text>
        <Text style={styles.role}>
          {user?.role === 'DOCTOR' ? 'Врач' : user?.role === 'ADMIN' ? 'Администратор' : 'Пациент'}
        </Text>
        {user?.role === 'DOCTOR' && <Text style={styles.specialty}>Специальность не указана</Text>}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
          <Ionicons name="create" size={24} color={COLORS.light.primary} />
          <Text style={styles.actionButtonText}>Редактировать профиль</Text>
        </TouchableOpacity>

        {renderRoleSpecificActions()}

        <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
          <Ionicons name="key" size={24} color={COLORS.light.primary} />
          <Text style={styles.actionButtonText}>Сменить пароль</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
  },
  actionButtonText: {
    color: COLORS.light.text,
    fontSize: 16,
    marginLeft: 12,
  },
  avatar: {
    borderRadius: 50,
    height: 100,
    width: 100,
  },
  avatarContainer: {
    position: 'relative',
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  editAvatarButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 20,
    bottom: 0,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 40,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.light.whiteBackground,
    padding: 20,
  },
  name: {
    color: COLORS.light.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  role: {
    color: COLORS.light.primary,
    fontSize: 18,
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  specialty: {
    color: COLORS.light.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
});

export default ProfileScreen;
