import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Notification } from '../types/notification';
import { formatDate } from '../utils/dateUtils';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useUserStorage } from '../contexts/UserStorageContext';
import { API_URL } from '../config/api';

export const NotificationsScreen: React.FC = () => {
  const { getToken } = useUserStorage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const response = await fetch(`${API_URL}/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      } else {
        setError(data.message || 'Ошибка при загрузке уведомлений');
      }
    } catch (err) {
      setError('Ошибка при загрузке уведомлений');
      console.error('Ошибка при загрузке уведомлений:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(
          notifications.map(notification =>
            notification._id === notificationId ? { ...notification, isRead: true } : notification
          )
        );
      }
    } catch (err) {
      console.error('Ошибка при отметке уведомления как прочитанного:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    } catch (error) {
      console.error('Ошибка при отметке всех уведомлений как прочитанных:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.filter(notification => notification._id !== notificationId));
      }
    } catch (err) {
      console.error('Ошибка при удалении уведомления:', err);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <View style={styles.notificationActions}>
        {!item.isRead && (
          <TouchableOpacity style={styles.actionButton} onPress={() => handleMarkAsRead(item._id)}>
            <Text style={styles.actionButtonText}>Отметить как прочитанное</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteNotification(item._id)}
        >
          <Text style={styles.actionButtonText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Уведомления</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllButton}>Отметить все как прочитанные</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item._id}
        refreshing={loading}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Нет уведомлений</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  markAllButton: {
    ...typography.button,
    color: colors.primary,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  notificationContent: {
    flex: 1,
  },
  notificationDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  notificationItem: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    padding: 16,
  },
  notificationMessage: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  notificationTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  unreadNotification: {
    backgroundColor: colors.background,
  },
});
