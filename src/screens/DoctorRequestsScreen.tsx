import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants';
import { apiClient } from '../api/apiClient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useUserStorage } from '../contexts/UserStorageContext';
import { DoctorRequest } from '../types/doctor';
import { ApiResponse } from '../types/api';
import { colors } from '../theme/colors';

// Добавляем экран для деталей запроса
export const DoctorRequestDetailsScreen: React.FC<{ route: any }> = ({ route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { requestId } = route.params;

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<DoctorRequest | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequestDetails();
  }, [requestId]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/doctor-requests/${requestId}`);
      setRequest(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке деталей запроса:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить детали запроса');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async () => {
    try {
      setProcessing(true);
      await apiClient.put(`/admin/doctor-requests/${requestId}`, { approved: true });
      Alert.alert('Успех', 'Запрос одобрен. Пользователь получил роль доктора.');
      navigation.goBack();
    } catch (error) {
      console.error('Ошибка при одобрении запроса:', error);
      Alert.alert('Ошибка', 'Не удалось одобрить запрос');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async () => {
    try {
      setProcessing(true);
      await apiClient.put(`/admin/doctor-requests/${requestId}`, { approved: false });
      Alert.alert('Успех', 'Запрос отклонен');
      navigation.goBack();
    } catch (error) {
      console.error('Ошибка при отклонении запроса:', error);
      Alert.alert('Ошибка', 'Не удалось отклонить запрос');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t('Детали запроса')}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t('Детали запроса')}
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {t('Запрос не найден')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {t('Детали запроса')}
            </Text>
          </View>

          <ScrollView style={styles.content} bounces={false} showsVerticalScrollIndicator={false}>
            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <View style={styles.statusSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {t('Статус')}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        request.status === 'approved'
                          ? COLORS.success
                          : request.status === 'rejected'
                            ? COLORS.error
                            : COLORS.warning,
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {request.status === 'approved'
                      ? t('Одобрен')
                      : request.status === 'rejected'
                        ? t('Отклонен')
                        : t('Ожидает')}
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {t('Информация о враче')}
                </Text>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                    {t('Имя')}:
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {request.user.firstName} {request.user.lastName}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                    {t('Email')}:
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {request.user.email}
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {t('Профессиональная информация')}
                </Text>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                    {t('Специализация')}:
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {request.specialization}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                    {t('Опыт работы')}:
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {request.experience}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                    {t('Образование')}:
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {request.education}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                    {t('Номер лицензии')}:
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {request.licenseNumber}
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {t('О себе')}
                </Text>
                <Text style={[styles.aboutText, { color: theme.colors.text }]}>
                  {request.about}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('Даты')}</Text>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                    {t('Дата создания')}:
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {formatDate(request.createdAt)}
                  </Text>
                </View>
                {request.processedAt && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                      {t('Дата обработки')}:
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      {formatDate(request.processedAt)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {request.status === 'pending' && (
            <View style={[styles.footer, { backgroundColor: theme.colors.card }]}>
              <TouchableOpacity
                style={[styles.footerButton, { backgroundColor: COLORS.error }]}
                onPress={handleRejectRequest}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.footerButtonText}>{t('Отклонить')}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerButton, { backgroundColor: COLORS.success }]}
                onPress={handleApproveRequest}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.footerButtonText}>{t('Одобрить')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// Мемоизированный рендер элемента запроса
const RequestListItem = React.memo(
  ({
    item,
    theme,
    formatDate,
    onViewDetails,
    onApprove,
    onReject,
    processingRequestId,
  }: {
    item: DoctorRequest;
    theme: any;
    formatDate: (date: string) => string;
    onViewDetails: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    processingRequestId: string | null;
  }) => (
    <View style={[styles.requestCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.requestHeader}>
        <View>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {item.user.firstName} {item.user.lastName}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
            {item.user.email}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'approved'
                  ? COLORS.success
                  : item.status === 'rejected'
                    ? COLORS.error
                    : COLORS.warning,
            },
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === 'approved'
              ? 'Одобрен'
              : item.status === 'rejected'
                ? 'Отклонен'
                : 'Ожидает'}
          </Text>
        </View>
      </View>

      <View style={styles.requestInfo}>
        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
          Специализация:
        </Text>
        <Text style={[styles.infoValue, { color: theme.colors.text }]}>{item.specialization}</Text>
      </View>

      <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
        Создан: {formatDate(item.createdAt)}
      </Text>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => onViewDetails(item._id)}
        >
          <Text style={styles.actionButtonText}>Детали</Text>
        </TouchableOpacity>

        {item.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.success }]}
              onPress={() => onApprove(item._id)}
              disabled={processingRequestId === item._id}
            >
              {processingRequestId === item._id ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.actionButtonText}>Одобрить</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.error }]}
              onPress={() => onReject(item._id)}
              disabled={processingRequestId === item._id}
            >
              {processingRequestId === item._id ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.actionButtonText}>Отклонить</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
);

// Основной экран запросов докторов
export const DoctorRequestsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useUserStorage();
  const [requests, setRequests] = useState<DoctorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3000/api/doctor-requests', {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = (await response.json()) as ApiResponse<DoctorRequest[]>;
      if (data.success) {
        setRequests(data.data);
      } else {
        setError(data.message || 'Ошибка при загрузке заявок');
      }
    } catch (err) {
      setError('Ошибка при загрузке заявок');
      console.error('Ошибка при загрузке заявок:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/doctor-requests/${requestId}/${action}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const data = (await response.json()) as ApiResponse<DoctorRequest>;
      if (data.success) {
        setRequests(requests.filter(request => request._id !== requestId));
      } else {
        setError(
          data.message || `Ошибка при ${action === 'approve' ? 'одобрении' : 'отклонении'} заявки`
        );
      }
    } catch (err) {
      setError(`Ошибка при ${action === 'approve' ? 'одобрении' : 'отклонении'} заявки`);
      console.error(`Ошибка при ${action === 'approve' ? 'одобрении' : 'отклонении'} заявки:`, err);
    }
  };

  const renderRequestItem = ({ item }: { item: DoctorRequest }) => (
    <TouchableOpacity
      style={styles.requestItem}
      onPress={() => navigation.navigate('DoctorRequestDetails', { requestId: item._id })}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestName}>
          {item.user.firstName} {item.user.lastName}
        </Text>
        <Text
          style={[
            styles.requestStatus,
            item.status === 'pending' && styles.statusPending,
            item.status === 'approved' && styles.statusApproved,
            item.status === 'rejected' && styles.statusRejected,
          ]}
        >
          {item.status === 'pending' && 'На рассмотрении'}
          {item.status === 'approved' && 'Одобрено'}
          {item.status === 'rejected' && 'Отклонено'}
        </Text>
      </View>
      <Text style={styles.requestSpecialization}>{item.specialization}</Text>
      <Text style={styles.requestExperience}>Опыт работы: {item.experience} лет</Text>
      {item.status === 'pending' && (
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleRequest(item._id, 'approve')}
          >
            <Text style={styles.actionButtonText}>Одобрить</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRequest(item._id, 'reject')}
          >
            <Text style={styles.actionButtonText}>Отклонить</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRequests}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  backButton: {
    marginRight: 16,
  },
  card: {
    borderRadius: 10,
    elevation: 2,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateText: {
    fontSize: 12,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopColor: '#f0f0f0',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    padding: 16,
    position: 'relative',
    right: 0,
    zIndex: 2,
  },
  footerButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 8,
    paddingVertical: 12,
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? '#FFFFFF' : undefined,
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoSection: {
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingBottom: 16,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  requestCard: {
    borderRadius: 10,
    elevation: 2,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  requestInfo: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusSection: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  list: {
    padding: 16,
  },
  requestItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  requestStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusPending: {
    color: colors.warning,
  },
  statusApproved: {
    color: colors.success,
  },
  statusRejected: {
    color: colors.error,
  },
  requestSpecialization: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  requestExperience: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});
