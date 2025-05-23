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
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { useUserStorage } from '../contexts/UserStorageContext';
import { API_URL } from '../config/api';
import { useTranslation } from 'react-i18next';

export const NotificationsScreen: React.FC = () => {
  const { t } = useTranslation();
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
        setError(data.message || t('notifications.errors.loadFailed'));
      }
    } catch (err) {
      setError(t('notifications.errors.loadFailed'));
      console.error(t('notifications.errors.loadFailed'), err);
    } finally {
      setLoading(false);
    }
  }, [getToken, t]);

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
      console.error(t('notifications.errors.markReadFailed'), err);
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
      console.error(t('notifications.errors.markAllReadFailed'), error);
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
      console.error(t('notifications.errors.deleteFailed'), err);
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
            <Text style={styles.actionButtonText}>{t('notifications.actions.markAsRead')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteNotification(item._id)}
        >
          <Text style={styles.actionButtonText}>{t('notifications.actions.delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.light.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
          <Text style={styles.retryButtonText}>{t('notifications.actions.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('notifications.title')}</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllButton}>{t('notifications.actions.markAllAsRead')}</Text>
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
            <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    color: COLORS.light.white,
    fontSize: 14,
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: COLORS.light.error,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.light.text.secondary,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.light.error,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: COLORS.light.border,
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
    ...TYPOGRAPHY.button,
    color: COLORS.light.primary,
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
    ...TYPOGRAPHY.caption,
    color: COLORS.light.text.secondary,
  },
  notificationItem: {
    borderBottomColor: COLORS.light.border,
    borderBottomWidth: 1,
    padding: 16,
  },
  notificationMessage: {
    ...TYPOGRAPHY.body1,
    color: COLORS.light.text.secondary,
    marginBottom: 8,
  },
  notificationTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.light.text.primary,
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: COLORS.light.white,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.light.text.primary,
  },
  unreadNotification: {
    backgroundColor: COLORS.light.background,
  },
});
