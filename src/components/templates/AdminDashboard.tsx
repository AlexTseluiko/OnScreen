import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { adminApi, AdminStats } from '../../api/admin';
import { Card } from '../atoms/Card';
import { Text } from '../atoms/Text';

type RootStackParamList = {
  AdminUsersScreen: undefined;
  ClinicsManagementScreen: undefined;
  NotificationsManagementScreen: undefined;
};

type AdminDashboardProps = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      await adminApi.getUsers({ role: 'DOCTOR' });
      await adminApi.getUsers({ role: 'PATIENT' });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadStats();
  }, [loadData, loadStats]);

  // Определяем темную тему на основе цвета фона
  const isDarkMode = theme.colors.background === theme.colors.black;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="title" style={styles.headerTitle}>
          {t('admin.dashboard.title', 'Панель администратора')}
        </Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Ionicons
            name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.row}>
          <Card
            style={[
              styles.card,
              styles.cardUser,
              {
                backgroundColor: isDarkMode ? 'rgba(52, 152, 219, 0.2)' : 'rgba(52, 152, 219, 0.1)',
              },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={32} color={theme.colors.primary} />
              </View>
              <Text variant="title" style={styles.cardValue}>
                {stats?.totalUsers || 0}
              </Text>
              <Text variant="body" style={styles.cardLabel}>
                {t('admin.dashboard.totalUsers', 'Всего пользователей')}
              </Text>
            </View>
          </Card>

          <Card
            style={[
              styles.card,
              styles.cardClinic,
              {
                backgroundColor: isDarkMode ? 'rgba(46, 204, 113, 0.2)' : 'rgba(46, 204, 113, 0.1)',
              },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="hospital" size={28} color={theme.colors.primary} />
              </View>
              <Text variant="title" style={styles.cardValue}>
                {stats?.clinics || 0}
              </Text>
              <Text variant="body" style={styles.cardLabel}>
                {t('admin.dashboard.clinics', 'Клиники')}
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.row}>
          <Card
            style={[
              styles.card,
              styles.cardDoctor,
              {
                backgroundColor: isDarkMode ? 'rgba(26, 188, 156, 0.2)' : 'rgba(26, 188, 156, 0.1)',
              },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="user-md" size={28} color="#4f8a8b" />
              </View>
              <Text variant="title" style={styles.cardValue}>
                {stats?.usersByRole.doctors || 0}
              </Text>
              <Text variant="body" style={styles.cardLabel}>
                {t('admin.dashboard.doctors', 'Врачи')}
              </Text>
            </View>
          </Card>

          <Card
            style={[
              styles.card,
              styles.cardPatient,
              { backgroundColor: isDarkMode ? 'rgba(231, 76, 60, 0.2)' : 'rgba(231, 76, 60, 0.1)' },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="user" size={28} color="#f67e7d" />
              </View>
              <Text variant="title" style={styles.cardValue}>
                {stats?.usersByRole.patients || 0}
              </Text>
              <Text variant="body" style={styles.cardLabel}>
                {t('admin.dashboard.patients', 'Пациенты')}
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.row}>
          <Card
            style={[
              styles.card,
              styles.cardAppointment,
              {
                backgroundColor: isDarkMode ? 'rgba(241, 196, 15, 0.2)' : 'rgba(241, 196, 15, 0.1)',
              },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={32} color="#f8b400" />
              </View>
              <Text variant="title" style={styles.cardValue}>
                {stats?.appointments || 0}
              </Text>
              <Text variant="body" style={styles.cardLabel}>
                {t('admin.dashboard.appointments', 'Приемы')}
              </Text>
            </View>
          </Card>

          <Card
            style={[
              styles.card,
              styles.cardReview,
              {
                backgroundColor: isDarkMode ? 'rgba(155, 89, 182, 0.2)' : 'rgba(155, 89, 182, 0.1)',
              },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="star" size={32} color="#9b5de5" />
              </View>
              <Text variant="title" style={styles.cardValue}>
                {stats?.pendingReviews || 0}
              </Text>
              <Text variant="body" style={styles.cardLabel}>
                {t('admin.dashboard.pendingReviews', 'Отзывы')}
              </Text>
            </View>
          </Card>
        </View>
      </View>

      <View style={styles.adminActions}>
        <Card
          style={[
            styles.adminActionButton,
            { backgroundColor: isDarkMode ? 'rgba(41, 50, 65, 0.8)' : 'rgba(255, 255, 255, 0.8)' },
          ]}
          onPress={() => navigation.navigate('AdminUsersScreen')}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="people" size={24} color={theme.colors.primary} />
            <Text variant="body" style={styles.buttonText}>
              {t('admin.dashboard.manageUsers', 'Управление пользователями')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text.primary} />
        </Card>

        <Card
          style={[
            styles.adminActionButton,
            { backgroundColor: isDarkMode ? 'rgba(41, 50, 65, 0.8)' : 'rgba(255, 255, 255, 0.8)' },
          ]}
          onPress={() => navigation.navigate('ClinicsManagementScreen')}
        >
          <View style={styles.buttonContent}>
            <FontAwesome5 name="hospital" size={22} color={theme.colors.primary} />
            <Text variant="body" style={styles.buttonText}>
              {t('admin.dashboard.manageClinics', 'Управление клиниками')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text.primary} />
        </Card>

        <Card
          style={[
            styles.adminActionButton,
            { backgroundColor: isDarkMode ? 'rgba(41, 50, 65, 0.8)' : 'rgba(255, 255, 255, 0.8)' },
          ]}
          onPress={() => navigation.navigate('NotificationsManagementScreen')}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="notifications" size={24} color="#f8b400" />
            <Text variant="body" style={styles.buttonText}>
              {t('admin.dashboard.sendNotifications', 'Отправка уведомлений')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text.primary} />
        </Card>
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          loadData();
          loadStats();
        }}
      >
        <Ionicons name="refresh" size={24} color={theme.colors.text.inverse} />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  adminActionButton: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    marginLeft: 10,
  },
  card: {
    borderRadius: 16,
    elevation: 3,
    flex: 1,
    margin: 8,
    padding: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardAppointment: {
    borderColor: '#f8b400',
    borderWidth: 1,
  },
  cardClinic: {
    borderColor: '#2ecc71',
    borderWidth: 1,
  },
  cardContent: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 16,
  },
  cardDoctor: {
    borderColor: '#4f8a8b',
    borderWidth: 1,
  },
  cardLabel: {
    marginTop: 4,
  },
  cardPatient: {
    borderColor: '#f67e7d',
    borderWidth: 1,
  },
  cardReview: {
    borderColor: '#9b5de5',
    borderWidth: 1,
  },
  cardUser: {
    borderColor: '#3498db',
    borderWidth: 1,
  },
  cardValue: {
    fontSize: 24,
    marginTop: 8,
  },
  container: {
    flex: 1,
  },
  fab: {
    alignItems: 'center',
    borderRadius: 30,
    bottom: 20,
    elevation: 5,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 60,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  statsContainer: {
    marginVertical: 16,
  },
  themeToggle: {
    borderRadius: 20,
    padding: 8,
  },
});
