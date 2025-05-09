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
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/colors';
import { apiClient } from '../api/apiClient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStorage } from '../contexts/UserStorageContext';
import { DoctorRequest } from '../types/doctor';
import { ApiResponse } from '../types/api';

interface DoctorRequestsResponse extends ApiResponse<{ requests: DoctorRequest[] }> {}

type DoctorRequestsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DoctorRequests'>;

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  backButton: ViewStyle;
  listContent: ViewStyle;
  requestItem: ViewStyle;
  requestHeader: ViewStyle;
  requestTitle: TextStyle;
  statusBadge: ViewStyle;
  statusText: TextStyle;
  infoRow: ViewStyle;
  label: TextStyle;
  value: TextStyle;
  aboutSection: ViewStyle;
  aboutTitle: TextStyle;
  aboutText: TextStyle;
  actionsContainer: ViewStyle;
  actionButton: ViewStyle;
  actionButtonText: TextStyle;
  approveButton: ViewStyle;
  rejectButton: ViewStyle;
  centered: ViewStyle;
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
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const response = await apiClient.get<DoctorRequestsResponse>('/admin/doctor-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 'success' && response.data) {
        setRequests(response.data.requests);
      } else {
        throw new Error(response.message || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setProcessing(true);
      setError(null);
      const token = await getToken();
      const response = await apiClient.put<ApiResponse<void>>(
        `/admin/doctor-requests/${requestId}`,
        { approved: action === 'approve' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 'success') {
        await fetchRequests();
        Alert.alert('Success', action === 'approve' ? 'Request approved' : 'Request rejected');
      } else {
        throw new Error(response.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      setError('Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

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
    <View style={[styles.requestItem, { backgroundColor: theme.colors.cardBackground }]}>
      <View style={styles.requestHeader}>
        <Text style={[styles.requestTitle, { color: theme.colors.text }]}>
          {item.user.firstName} {item.user.lastName}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{t(`status.${item.status}`)}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {t('specialization')}:
        </Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{item.specialization}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {t('experience')}:
        </Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{item.experience}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('education')}:</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{item.education}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {t('licenseNumber')}:
        </Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{item.licenseNumber}</Text>
      </View>
      <View style={styles.aboutSection}>
        <Text style={[styles.aboutTitle, { color: theme.colors.text }]}>{t('about')}</Text>
        <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>{item.about}</Text>
      </View>
      {item.status === 'pending' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleRequest(item._id, 'approve')}
            disabled={processing}
          >
            <Text style={styles.actionButtonText}>{t('approve')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRequest(item._id, 'reject')}
            disabled={processing}
          >
            <Text style={styles.actionButtonText}>{t('reject')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
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
            backgroundColor: theme.colors.cardBackground,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t('doctorRequests')}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
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
  requestItem: {
    borderRadius: 8,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    width: 100,
  },
  value: {
    flex: 1,
    fontSize: 14,
  },
  aboutSection: {
    marginTop: 12,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.danger,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
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
