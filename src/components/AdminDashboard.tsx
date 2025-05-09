import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { profileApi } from '../api/profile';
import { StackNavigationProp } from '@react-navigation/stack';
import { adminApi, AdminStats } from '../api/admin';

interface UserListItem {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  verified?: boolean;
}

type AdminDashboardProps = {
  navigation: StackNavigationProp<any>;
};

export const AdminDashboard = ({ navigation }: AdminDashboardProps) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<UserListItem[]>([]);
  const [patients, setPatients] = useState<UserListItem[]>([]);
  const [activeTab, setActiveTab] = useState<'doctors' | 'patients'>('doctors');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    loadStats();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Получаем список врачей
      const doctorsData = await adminApi.getUsers({ role: 'DOCTOR' });
      // Получаем список пациентов
      const patientsData = await adminApi.getUsers({ role: 'PATIENT' });

      setDoctors(
        doctorsData.users.map(d => ({
          id: d._id,
          name: `${d.firstName || ''} ${d.lastName || ''}`.trim(),
          role: 'doctor',
          email: d.email,
          avatar: d.avatar,
          verified: d.verified,
        }))
      );

      setPatients(
        patientsData.users.map(p => ({
          id: p._id,
          name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
          role: 'patient',
          email: p.email,
          avatar: p.avatar,
        }))
      );
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
      setError(t('admin.dashboard.loadError', 'Ошибка загрузки статистики'));
    }
  };

  const handleVerifyDoctor = async (userId: string, verified: boolean) => {
    try {
      await adminApi.verifyDoctor(userId, verified);
      loadData();
    } catch (error) {
      console.error('Error verifying doctor:', error);
    }
  };

  // Определяем темную тему на основе цвета фона
  const isDarkMode = theme.colors.background === '#121212';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('admin.dashboard.title', 'Панель администратора')}
        </Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Ionicons
            name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.row}>
          <View
            style={[
              styles.card,
              styles.cardUser,
              { backgroundColor: isDarkMode ? '#2a2d3a' : '#e6f2ff' },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={32} color={theme.colors.primary} />
              </View>
              <Text style={[styles.cardValue, { color: theme.colors.text }]}>
                {stats?.totalUsers || 0}
              </Text>
              <Text style={[styles.cardLabel, { color: theme.colors.text }]}>
                {t('admin.dashboard.totalUsers', 'Всего пользователей')}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              styles.cardClinic,
              { backgroundColor: isDarkMode ? '#302a3a' : '#e6fff2' },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="hospital" size={28} color={theme.colors.primary} />
              </View>
              <Text style={[styles.cardValue, { color: theme.colors.text }]}>
                {stats?.clinics || 0}
              </Text>
              <Text style={[styles.cardLabel, { color: theme.colors.text }]}>
                {t('admin.dashboard.clinics', 'Клиники')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View
            style={[
              styles.card,
              styles.cardDoctor,
              { backgroundColor: isDarkMode ? '#2a3a3a' : '#e6ffff' },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="user-md" size={28} color="#4f8a8b" />
              </View>
              <Text style={[styles.cardValue, { color: theme.colors.text }]}>
                {stats?.usersByRole.doctors || 0}
              </Text>
              <Text style={[styles.cardLabel, { color: theme.colors.text }]}>
                {t('admin.dashboard.doctors', 'Врачи')}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              styles.cardPatient,
              { backgroundColor: isDarkMode ? '#3a2a2a' : '#ffe6e6' },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="user" size={28} color="#f67e7d" />
              </View>
              <Text style={[styles.cardValue, { color: theme.colors.text }]}>
                {stats?.usersByRole.patients || 0}
              </Text>
              <Text style={[styles.cardLabel, { color: theme.colors.text }]}>
                {t('admin.dashboard.patients', 'Пациенты')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View
            style={[
              styles.card,
              styles.cardAppointment,
              { backgroundColor: isDarkMode ? '#3a3a2a' : '#fffde6' },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={32} color="#f8b400" />
              </View>
              <Text style={[styles.cardValue, { color: theme.colors.text }]}>
                {stats?.appointments || 0}
              </Text>
              <Text style={[styles.cardLabel, { color: theme.colors.text }]}>
                {t('admin.dashboard.appointments', 'Приемы')}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              styles.cardReview,
              { backgroundColor: isDarkMode ? '#352a3a' : '#f2e6ff' },
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="star" size={32} color="#9b5de5" />
              </View>
              <Text style={[styles.cardValue, { color: theme.colors.text }]}>
                {stats?.pendingReviews || 0}
              </Text>
              <Text style={[styles.cardLabel, { color: theme.colors.text }]}>
                {t('admin.dashboard.pendingReviews', 'Отзывы')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.adminActions}>
        <TouchableOpacity
          style={[
            styles.adminActionButton,
            {
              backgroundColor: isDarkMode ? '#2a2d3a' : '#ffffff',
              shadowColor: theme.colors.text,
            },
          ]}
          onPress={() => navigation.navigate('AdminUsersScreen')}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="people" size={24} color={theme.colors.primary} />
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              {t('admin.dashboard.manageUsers', 'Управление пользователями')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.adminActionButton,
            {
              backgroundColor: isDarkMode ? '#2a2d3a' : '#ffffff',
              shadowColor: theme.colors.text,
            },
          ]}
          onPress={() => navigation.navigate('ClinicsManagementScreen')}
        >
          <View style={styles.buttonContent}>
            <FontAwesome5 name="hospital" size={22} color={theme.colors.primary} />
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              {t('admin.dashboard.manageClinics', 'Управление клиниками')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.adminActionButton,
            {
              backgroundColor: isDarkMode ? '#2a2d3a' : '#ffffff',
              shadowColor: theme.colors.text,
            },
          ]}
          onPress={() => navigation.navigate('NotificationsManagementScreen')}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="notifications" size={24} color="#f8b400" />
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              {t('admin.dashboard.sendNotifications', 'Отправка уведомлений')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          loadData();
          loadStats();
        }}
      >
        <Ionicons name="refresh" size={24} color="white" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  activeTab: {
    borderBottomWidth: 2,
  },
  adminActionButton: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  adminActions: {
    marginBottom: 24,
    padding: 16,
  },
  avatar: {
    borderRadius: 25,
    height: 50,
    marginRight: 15,
    width: 50,
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 12,
  },
  card: {
    borderRadius: 12,
    elevation: 3,
    padding: 16,
    width: '48%',
  },
  cardAppointment: {},
  cardClinic: {},
  cardContent: {
    alignItems: 'flex-start',
  },
  cardDoctor: {},
  cardLabel: {
    fontSize: 14,
  },
  cardPatient: {},
  cardReview: {},
  cardUser: {},
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  fab: {
    alignItems: 'center',
    borderRadius: 28,
    bottom: 20,
    elevation: 5,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    width: 56,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  iconContainer: {
    marginBottom: 8,
  },
  noData: {
    fontSize: 16,
    marginTop: 50,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsContainer: {
    padding: 16,
  },
  tab: {
    marginRight: 10,
    padding: 10,
  },
  tabContainer: {
    borderBottomColor: '#e1e1e1',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginBottom: 15,
  },
  tabText: {
    fontSize: 16,
  },
  themeToggle: {
    padding: 8,
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userItem: {
    alignItems: 'center',
    borderBottomColor: '#e1e1e1',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  verifyButton: {
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 12,
  },
});
