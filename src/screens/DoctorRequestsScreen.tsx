/* eslint-disable react-native/sort-styles */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ViewStyle,
  TextStyle,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/colors';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../config/api';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStorage } from '../contexts/UserStorageContext';
import { DoctorRequest } from '../types/doctor';
import { ApiResponse } from '../types/api';

interface DoctorRequestsResponse {
  data: DoctorRequest[];
  pagination: {
    total: number;
    pages: number;
    page: number;
  };
}

type DoctorRequestsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DoctorRequests'>;

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  backButton: ViewStyle;
  listContent: ViewStyle;
  requestCard: ViewStyle;
  requestHeader: ViewStyle;
  requestTitle: TextStyle;
  requestDate: TextStyle;
  requestInfo: ViewStyle;
  infoLabel: TextStyle;
  infoValue: TextStyle;
  requestActions: ViewStyle;
  actionButton: ViewStyle;
  actionButtonText: TextStyle;
  approveButton: ViewStyle;
  rejectButton: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  retryButton: ViewStyle;
  retryButtonText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
}

export const DoctorRequestsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<DoctorRequestsScreenNavigationProp>();
  const { getToken } = useUserStorage();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DoctorRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response =
        await apiClient.get<ApiResponse<DoctorRequestsResponse>>('/admin/doctor-requests');

      if (response.data?.data) {
        setRequests(response.data.data.data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке запросов:', err);
      setError(t('errors.requestsLoadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleRequestAction = useCallback(
    async (requestId: string, action: 'approve' | 'reject') => {
      try {
        const response = await apiClient.post<ApiResponse<void>>(
          `/admin/doctor-requests/${requestId}`,
          { action }
        );

        if (response.data?.data !== undefined) {
          await fetchRequests();
          Alert.alert(t('success'), t('requests.actionSuccess'));
        }
      } catch (err) {
        console.error('Ошибка при обработке запроса:', err);
        Alert.alert(t('error'), t('errors.requestActionError'));
      }
    },
    [t, fetchRequests]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, [fetchRequests]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getStatusColor = (status: DoctorRequest['status']) => {
    switch (status) {
      case 'approved':
        return COLORS.success;
      case 'rejected':
        return COLORS.danger;
      default:
        return COLORS.warning;
    }
  };

  const renderRequestItem = ({ item }: { item: DoctorRequest }) => (
    <View style={[styles.requestCard, { backgroundColor: theme.colors.background }]}>
      <View style={styles.requestHeader}>
        <Text style={[styles.requestTitle, { color: theme.colors.text.primary }]}>
          {item.user.firstName} {item.user.lastName}
        </Text>
        <Text style={[styles.requestDate, { color: theme.colors.text.secondary }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.requestInfo}>
        <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
          {t('requests.specialization')}:
        </Text>
        <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
          {item.specialization}
        </Text>
      </View>

      <View style={styles.requestInfo}>
        <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
          {t('requests.experience')}:
        </Text>
        <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
          {item.experience} {t('years')}
        </Text>
      </View>

      <View style={styles.requestInfo}>
        <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
          {t('requests.education')}:
        </Text>
        <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
          {item.education}
        </Text>
      </View>

      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleRequestAction(item._id, 'approve')}
        >
          <Text style={styles.actionButtonText}>{t('requests.approve')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRequestAction(item._id, 'reject')}
        >
          <Text style={styles.actionButtonText}>{t('requests.reject')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
          {t('loading')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={fetchRequests}
        >
          <Text style={styles.retryButtonText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            {t('doctorRequests')}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
              {t('noRequests')}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
  },
  listContent: {
    padding: 16,
  },
  requestCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  requestDate: {
    fontSize: 14,
  },
  requestInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.danger,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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
  retryButton: {
    borderRadius: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DoctorRequestsScreen;
