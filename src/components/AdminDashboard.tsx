import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { adminApi, AdminStats } from '../api/admin';
import { COLORS } from '../constants';

type RootStackParamList = {
  AdminUsersScreen: undefined;
  ClinicsManagementScreen: undefined;
  NotificationsManagementScreen: undefined;
};

type AdminDashboardProps = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export const AdminDashboard = ({ navigation }: AdminDashboardProps) => {
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
  const isDarkMode = theme.colors.background === COLORS.black;

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
              isDarkMode ? styles.cardUserDark : styles.cardUserLight,
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
              isDarkMode ? styles.cardClinicDark : styles.cardClinicLight,
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
              isDarkMode ? styles.cardDoctorDark : styles.cardDoctorLight,
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
              isDarkMode ? styles.cardPatientDark : styles.cardPatientLight,
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
              isDarkMode ? styles.cardAppointmentDark : styles.cardAppointmentLight,
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
              isDarkMode ? styles.cardReviewDark : styles.cardReviewLight,
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
            isDarkMode ? styles.adminActionButtonDark : styles.adminActionButtonLight,
            { shadowColor: theme.colors.text },
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
            isDarkMode ? styles.adminActionButtonDark : styles.adminActionButtonLight,
            { shadowColor: theme.colors.text },
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
            isDarkMode ? styles.adminActionButtonDark : styles.adminActionButtonLight,
            { shadowColor: theme.colors.text },
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
  adminActionButtonDark: {
    backgroundColor: COLORS.darkBackground,
  },
  adminActionButtonLight: {
    backgroundColor: COLORS.white,
  },
  adminActions: {
    marginBottom: 24,
    padding: 16,
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
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
  },
  cardAppointment: {
    backgroundColor: COLORS.warning,
  },
  cardAppointmentDark: {
    backgroundColor: COLORS.darkAppointment,
  },
  cardAppointmentLight: {
    backgroundColor: COLORS.lightAppointment,
  },
  cardClinic: {
    backgroundColor: COLORS.secondary,
  },
  cardClinicDark: {
    backgroundColor: COLORS.darkClinic,
  },
  cardClinicLight: {
    backgroundColor: COLORS.lightClinic,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardDoctor: {
    backgroundColor: COLORS.success,
  },
  cardDoctorDark: {
    backgroundColor: COLORS.darkDoctor,
  },
  cardDoctorLight: {
    backgroundColor: COLORS.lightDoctor,
  },
  cardLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  cardPatient: {
    backgroundColor: COLORS.danger,
  },
  cardPatientDark: {
    backgroundColor: COLORS.darkPatient,
  },
  cardPatientLight: {
    backgroundColor: COLORS.lightPatient,
  },
  cardReview: {
    backgroundColor: COLORS.emergency,
  },
  cardReviewDark: {
    backgroundColor: COLORS.darkReview,
  },
  cardReviewLight: {
    backgroundColor: COLORS.lightReview,
  },
  cardUser: {
    backgroundColor: COLORS.primary,
  },
  cardUserDark: {
    backgroundColor: COLORS.black,
  },
  cardUserLight: {
    backgroundColor: COLORS.primary,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
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
    borderBottomColor: COLORS.lightGray,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparent,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 8,
    width: 48,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsContainer: {
    padding: 16,
  },
  themeToggle: {
    padding: 8,
  },
});
