/**
 * Сервис для работы с push-уведомлениями
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { MedicationReminder, Medication } from '../api/medications';

// Типы для уведомлений
type NotificationResponse = {
  notification: {
    request: {
      content: {
        data: {
          reminderId: string;
          medicationId: string;
          type: string;
        };
      };
    };
  };
};

// Настройка уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Сервис для работы с push-уведомлениями
 */
export class NotificationService {
  /**
   * Проверяет, есть ли у приложения разрешение на отправку уведомлений
   */
  static async checkPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medication-reminders', {
        name: 'Напоминания о приеме лекарств',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } else {
      console.log('Для реальных уведомлений требуется физическое устройство');
      return false;
    }
  }

  /**
   * Получает токен для push-уведомлений
   */
  static async getPushToken(): Promise<string | null> {
    try {
      const hasPermission = await this.checkPermissions();

      if (!hasPermission) {
        console.log('Нет разрешения на push-уведомления');
        return null;
      }

      if (!Device.isDevice) {
        console.log('Для получения токена push-уведомлений требуется физическое устройство');
        return null;
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId: '123456789', // Замените на ваш projectId из expo-cli
      });

      return token;
    } catch (error) {
      console.error('Ошибка при получении токена для push-уведомлений:', error);
      return null;
    }
  }

  /**
   * Запланировать уведомление о приеме лекарства
   */
  static async scheduleMedicationReminder(
    medication: Medication,
    reminder: MedicationReminder
  ): Promise<string | null> {
    try {
      // Проверяем разрешения
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        console.log('Нет разрешения на отправку уведомлений');
        return null;
      }

      // Получаем дату и время из напоминания
      const [hour, minute] = reminder.time.split(':').map(Number);
      const [year, month, day] = reminder.date.split('-').map(Number);

      const scheduledTime = new Date();
      scheduledTime.setFullYear(year, month - 1, day);
      scheduledTime.setHours(hour, minute, 0);

      // Не отправляем уведомления для прошедших времен
      if (scheduledTime < new Date()) {
        return null;
      }

      // Запланировать уведомление
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Время принять лекарство: ${medication.name}`,
          body: `Доза: ${medication.dosage}. ${medication.instructions || ''}`,
          data: {
            medicationId: medication._id,
            reminderId: reminder._id,
            type: 'medication_reminder',
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: 'date',
          date: scheduledTime,
        } as Notifications.DateTriggerInput,
      });

      return notificationId;
    } catch (error) {
      console.error('Ошибка при планировании уведомления:', error);
      return null;
    }
  }

  /**
   * Отменить запланированное уведомление
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Ошибка при отмене уведомления:', error);
    }
  }

  /**
   * Отменить все запланированные уведомления
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Ошибка при отмене всех уведомлений:', error);
    }
  }
}

/**
 * Хук для обработки входящих уведомлений
 */
export function setupNotificationListeners(
  onReceive: (notification: Notifications.Notification) => void
) {
  const notificationListener = Notifications.addNotificationReceivedListener(onReceive);
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response: Notifications.NotificationResponse) => {
      const { reminderId, medicationId, type } = response.notification.request.content.data as {
        reminderId: string;
        medicationId: string;
        type: string;
      };

      // Здесь можно добавить логику навигации при нажатии на уведомление
      console.log('Пользователь нажал на уведомление:', { reminderId, medicationId, type });
    }
  );

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}
