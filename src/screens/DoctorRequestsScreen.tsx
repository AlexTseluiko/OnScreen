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
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants';
import { apiClient } from '../api/apiClient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

interface DoctorRequest {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  specialization: string;
  experience: string;
  education: string;
  licenseNumber: string;
  about: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
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
                <View style={[
                  styles.statusBadge, 
                  { 
                    backgroundColor: 
                      request.status === 'approved' ? COLORS.success : 
                      request.status === 'rejected' ? COLORS.error : 
                      COLORS.warning 
                  }
                ]}>
                  <Text style={styles.statusText}>
                    {request.status === 'approved' ? t('Одобрен') : 
                     request.status === 'rejected' ? t('Отклонен') : 
                     t('Ожидает')}
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
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {t('Даты')}
                </Text>
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
const RequestListItem = React.memo(({ 
  item, 
  theme, 
  formatDate, 
  onViewDetails, 
  onApprove, 
  onReject,
  processingRequestId
}: { 
  item: DoctorRequest, 
  theme: any, 
  formatDate: (date: string) => string,
  onViewDetails: (id: string) => void,
  onApprove: (id: string) => void,
  onReject: (id: string) => void,
  processingRequestId: string | null
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
      <View style={[
        styles.statusBadge, 
        { 
          backgroundColor: 
            item.status === 'approved' ? COLORS.success : 
            item.status === 'rejected' ? COLORS.error : 
            COLORS.warning 
        }
      ]}>
        <Text style={styles.statusText}>
          {item.status === 'approved' ? 'Одобрен' : 
           item.status === 'rejected' ? 'Отклонен' : 
           'Ожидает'}
        </Text>
      </View>
    </View>

    <View style={styles.requestInfo}>
      <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
        Специализация:
      </Text>
      <Text style={[styles.infoValue, { color: theme.colors.text }]}>
        {item.specialization}
      </Text>
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
));

// Основной экран запросов докторов
export const DoctorRequestsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DoctorRequest[]>([]);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/doctor-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке запросов:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить запросы на роль доктора');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      setProcessingRequestId(requestId);
      await apiClient.put(`/admin/doctor-requests/${requestId}`, { approved: true });
      Alert.alert('Успех', 'Запрос одобрен. Пользователь получил роль доктора.');
      loadRequests();
    } catch (error) {
      console.error('Ошибка при одобрении запроса:', error);
      Alert.alert('Ошибка', 'Не удалось одобрить запрос');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessingRequestId(requestId);
      await apiClient.put(`/admin/doctor-requests/${requestId}`, { approved: false });
      Alert.alert('Успех', 'Запрос отклонен');
      loadRequests();
    } catch (error) {
      console.error('Ошибка при отклонении запроса:', error);
      Alert.alert('Ошибка', 'Не удалось отклонить запрос');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleViewDetails = (requestId: string) => {
    navigation.navigate('DoctorRequestDetails', { requestId });
  };

  const renderRequestItem = ({ item }: { item: DoctorRequest }) => (
    <RequestListItem 
      item={item}
      theme={theme}
      formatDate={formatDate}
      onViewDetails={handleViewDetails}
      onApprove={handleApproveRequest}
      onReject={handleRejectRequest}
      processingRequestId={processingRequestId}
    />
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    </View>
  );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('Запросы на роль врача')}
        </Text>
      </View>
      
          {requests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {t('Нет запросов на рассмотрении')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={requests}
          renderItem={renderRequestItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
            />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: Platform.OS === 'ios' ? '#FFFFFF' : undefined,
    zIndex: 10,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  requestCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestInfo: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'relative',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 