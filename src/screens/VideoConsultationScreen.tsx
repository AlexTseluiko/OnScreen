import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { appointmentsApi } from '../api/appointments';
import { useTranslation } from 'react-i18next';

// Определение типа для AgoraUIKit
interface AgoraUIKitProps {
  rtcProps: {
    appId: string;
    channel: string;
    token: string | null;
  };
  callbacks?: {
    EndCall?: () => void;
  };
  styleProps?: {
    UIKitContainer?: React.CSSProperties;
    localBtnStyles?: Record<string, React.CSSProperties>;
    [key: string]: unknown;
  };
}

// Условный импорт AgoraUIKit
let AgoraUIKit: React.ComponentType<AgoraUIKitProps> | null = null;

// В web версии будем использовать заглушку
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AgoraUIKit = require('agora-react-uikit').default;
  } catch (error) {
    console.error('Ошибка при импорте agora-react-uikit:', error);
  }
}

// Интерфейс для параметров маршрута
interface VideoConsultationParams {
  appointmentId: string;
}

type VideoConsultationScreenRouteProp = RouteProp<
  { VideoConsultation: VideoConsultationParams },
  'VideoConsultation'
>;

// Тип для appointment
interface Appointment {
  id: string;
  date: string;
  time: string;
  patient: {
    firstName: string;
    lastName: string;
  };
  // Добавьте другие поля при необходимости
}

const VideoConsultationScreen: React.FC = () => {
  const route = useRoute<VideoConsultationScreenRouteProp>();
  const navigation = useNavigation();
  const { appointmentId } = route.params;
  const { t } = useTranslation();

  // Состояния
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [isEndModalVisible, setIsEndModalVisible] = useState<boolean>(false);
  const [videoCall, setVideoCall] = useState<boolean>(false);

  // Получение деталей приема
  const fetchAppointmentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appointmentsApi.getAppointmentDetails(appointmentId);
      setAppointment(response);
    } catch (err) {
      console.error('Ошибка при загрузке деталей приема:', err);
      setError(t('videoConsultation.error'));
    } finally {
      setLoading(false);
    }
  }, [appointmentId, t]);

  // Инициализация при входе на экран
  useEffect(() => {
    fetchAppointmentDetails();

    // Активация видеозвонка после загрузки информации
    setTimeout(() => {
      setVideoCall(true);
    }, 1000);

    return () => {
      // Отключение видеозвонка при уходе с экрана
      setVideoCall(false);
    };
  }, [fetchAppointmentDetails]);

  // Настройки видеозвонка Agora
  const rtcProps = {
    appId: 'ee4d8dc2d92f4cbdad934922db7e3585', // Замените на ваш App ID Agora
    channel: `appointment_${appointmentId}`,
    token: null, // Токен для аутентификации (null для тестирования)
  };

  // Настройки интерфейса видеозвонка
  const callbacks = {
    EndCall: () => {
      setVideoCall(false);
      setIsEndModalVisible(true);
    },
  };

  // Завершение консультации
  const completeConsultation = async () => {
    try {
      await appointmentsApi.completeAppointment(appointmentId, {
        diagnosis,
        notes,
      });

      Alert.alert(t('videoConsultation.success'), t('videoConsultation.consultationCompleted'), [
        {
          text: t('videoConsultation.ok'),
          onPress: () => navigation.navigate('DoctorSchedule' as never),
        },
      ]);
    } catch (err) {
      console.error('Ошибка при завершении консультации:', err);
      Alert.alert(t('error'), t('videoConsultation.completionError'));
    }
  };

  // Если загрузка
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.light.primary} />
        <Text style={styles.loadingText}>{t('videoConsultation.loading')}</Text>
      </View>
    );
  }

  // Если ошибка
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={COLORS.light.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAppointmentDetails}>
          <Text style={styles.retryButtonText}>{t('videoConsultation.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.patientName}>
          {appointment?.patient?.firstName} {appointment?.patient?.lastName}
        </Text>
        <Text style={styles.appointmentInfo}>
          {t('videoConsultation.consultation')}: {appointment?.date}, {appointment?.time}
        </Text>
      </View>

      {/* Область видеозвонка */}
      <View style={styles.videoContainer}>
        {videoCall && AgoraUIKit ? (
          <AgoraUIKit
            rtcProps={rtcProps}
            callbacks={callbacks}
            styleProps={{
              UIKitContainer: { height: '100%', width: '100%' },
              localBtnStyles: { muteLocalAudio: { backgroundColor: COLORS.light.primary } },
            }}
          />
        ) : (
          <View style={styles.connectingContainer}>
            <ActivityIndicator size="large" color={COLORS.light.primary} />
            <Text style={styles.connectingText}>
              {Platform.OS === 'web'
                ? t('videoConsultation.webNotSupported')
                : t('videoConsultation.connecting')}
            </Text>
          </View>
        )}
      </View>

      {/* Модальное окно завершения консультации */}
      <Modal visible={isEndModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('videoConsultation.endConsultation')}</Text>

            <Text style={styles.inputLabel}>{t('videoConsultation.diagnosis')}</Text>
            <TextInput
              style={styles.textInput}
              value={diagnosis}
              onChangeText={setDiagnosis}
              placeholder={t('videoConsultation.diagnosisPlaceholder')}
              multiline
            />

            <Text style={styles.inputLabel}>{t('videoConsultation.recommendations')}</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('videoConsultation.recommendationsPlaceholder')}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setIsEndModalVisible(false);
                  setVideoCall(true);
                }}
              >
                <Text style={styles.modalCancelButtonText}>{t('videoConsultation.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={completeConsultation}
              >
                <Text style={styles.modalConfirmButtonText}>{t('videoConsultation.complete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  appointmentInfo: {
    color: COLORS.light.text.secondary,
    fontSize: 14,
  },
  connectingContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.light.darkInputBackground,
    flex: 1,
    justifyContent: 'center',
  },
  connectingText: {
    color: COLORS.light.text.inverse,
    marginTop: 10,
    padding: 15,
    textAlign: 'center',
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.light.text.secondary,
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    backgroundColor: COLORS.light.surface,
    borderBottomColor: COLORS.light.border,
    borderBottomWidth: 1,
    padding: 15,
  },
  inputLabel: {
    color: COLORS.light.text.secondary,
    fontSize: 14,
    marginBottom: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.light.text.secondary,
    fontSize: 16,
    marginTop: 10,
  },
  modalButton: {
    alignItems: 'center',
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalCancelButton: {
    backgroundColor: COLORS.light.background,
    borderColor: COLORS.light.border,
    borderWidth: 1,
  },
  modalCancelButtonText: {
    color: COLORS.light.text.secondary,
    fontWeight: '500',
  },
  modalConfirmButton: {
    backgroundColor: COLORS.light.primary,
  },
  modalConfirmButtonText: {
    color: COLORS.light.text.inverse,
    fontWeight: '500',
  },
  modalContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.light.overlay,
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.light.surface,
    borderRadius: 10,
    minWidth: 300,
    padding: 20,
    shadowColor: COLORS.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '80%',
  },
  modalTitle: {
    color: COLORS.light.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  patientName: {
    color: COLORS.light.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 5,
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: COLORS.light.text.inverse,
    fontWeight: 'bold',
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  textInput: {
    backgroundColor: COLORS.light.inputBackground,
    borderColor: COLORS.light.border,
    borderRadius: 5,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 15,
    padding: 10,
  },
  videoContainer: {
    backgroundColor: COLORS.palette.black,
    flex: 1,
  },
});

export default VideoConsultationScreen;
