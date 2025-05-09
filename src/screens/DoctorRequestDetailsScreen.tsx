/* eslint-disable react-native/sort-styles */
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { Text, Button } from '../components/common';
import { apiClient } from '../api/apiClient';
import { ApiResponse } from '../types/api';
import { DoctorRequest } from '../types/doctor';
import { COLORS } from '../constants/colors';

type RouteParams = {
  DoctorRequestDetails: {
    requestId: string;
  };
};

type DoctorRequestDetailsScreenRouteProp = RouteProp<RouteParams, 'DoctorRequestDetails'>;
type DoctorRequestDetailsScreenNavigationProp = NativeStackNavigationProp<
  RouteParams,
  'DoctorRequestDetails'
>;

interface Props {
  route: DoctorRequestDetailsScreenRouteProp;
  navigation: DoctorRequestDetailsScreenNavigationProp;
}

export const DoctorRequestDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { requestId } = route.params;
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [request, setRequest] = useState<DoctorRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRequestDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<ApiResponse<{ request: DoctorRequest }>>(
        `/doctor-requests/${requestId}`
      );

      if (response.status === 'success' && response.data.request) {
        setRequest(response.data.request);
      } else {
        setError(response.message || 'Не удалось загрузить детали запроса');
      }
    } catch (error) {
      console.error('Error loading request details:', error);
      setError('Не удалось загрузить детали запроса');
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  const handleApproveRequest = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
        `/doctor-requests/${requestId}/approve`
      );

      if (response.status === 'success' && response.data.success) {
        Alert.alert('Успех', 'Запрос успешно одобрен');
        navigation.goBack();
      } else {
        setError(response.message || 'Произошла ошибка при одобрении запроса');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      setError('Не удалось одобрить запрос');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
        `/doctor-requests/${requestId}/reject`
      );

      if (response.status === 'success' && response.data.success) {
        Alert.alert('Успех', 'Запрос отклонен');
        navigation.goBack();
      } else {
        setError(response.message || 'Произошла ошибка при отклонении запроса');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError('Не удалось отклонить запрос');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    loadRequestDetails();
  }, [requestId, loadRequestDetails]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Повторить"
          onPress={loadRequestDetails}
          style={styles.retryButton}
          backgroundColor={theme.colors.primary}
        />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Запрос не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Информация о враче
          </Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>
            Имя: {request.user.firstName} {request.user.lastName}
          </Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>
            Специализация: {request.specialization}
          </Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>
            Опыт работы: {request.experience}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Контактная информация
          </Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>
            Email: {request.user.email}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Документы</Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>
            Лицензия: {request.licenseNumber}
          </Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>
            Образование: {request.education}
          </Text>
          <Text style={[styles.text, { color: theme.colors.text }]}>О себе: {request.about}</Text>
        </View>

        {request.status === 'pending' && (
          <View style={styles.buttonsContainer}>
            <Button
              title="Одобрить"
              onPress={handleApproveRequest}
              style={[styles.button, styles.approveButton]}
              backgroundColor={COLORS.success}
              disabled={isProcessing}
            />
            <Button
              title="Отклонить"
              onPress={handleRejectRequest}
              style={[styles.button, styles.rejectButton]}
              backgroundColor={COLORS.danger}
              disabled={isProcessing}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    borderRadius: 8,
    elevation: 2,
    marginBottom: 16,
    padding: 16,
    shadowColor: COLORS.shadow.light,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  approveButton: {
    marginLeft: 0,
  },
  rejectButton: {
    marginRight: 0,
  },
});

export default DoctorRequestDetailsScreen;
