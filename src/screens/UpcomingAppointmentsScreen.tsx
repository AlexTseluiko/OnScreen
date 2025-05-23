import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { appointmentsApi, Appointment, AppointmentStatus } from '../api/appointments';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

// Импорт атомарных компонентов
import { Text } from '../components/ui/atoms/Text';
import { Button } from '../components/ui/atoms/Button';
import { Card } from '../components/ui/molecules/Card';
import { Icon } from '../components/ui/atoms/Icon';
import { Badge } from '../components/ui/atoms/Badge';
import { Spinner } from '../components/ui/atoms/Spinner';

const UpcomingAppointmentsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentsApi.getUserAppointments();
      // Фильтруем и показываем только предстоящие приемы (PENDING, CONFIRMED)
      const upcomingAppointments = data.filter(
        app =>
          app.status === AppointmentStatus.PENDING || app.status === AppointmentStatus.CONFIRMED
      );
      setAppointments(upcomingAppointments);
    } catch (err) {
      console.error('Ошибка при загрузке записей на прием:', err);
      setError(t('upcomingAppointments.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancelAppointment = async (id: string) => {
    Alert.alert(t('upcomingAppointments.cancelTitle'), t('upcomingAppointments.cancelConfirm'), [
      { text: t('upcomingAppointments.no'), style: 'cancel' },
      {
        text: t('upcomingAppointments.yesCancel'),
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await appointmentsApi.cancelAppointment(id);
            // Обновляем список после отмены
            await fetchAppointments();
            Alert.alert(t('success'), t('upcomingAppointments.canceled'));
          } catch (err) {
            console.error('Ошибка при отмене приема:', err);
            Alert.alert(t('error'), t('upcomingAppointments.cancelError'));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleRescheduleAppointment = (_id: string) => {
    // Здесь будет логика переноса приема
    // В дальнейшем реализации потребуется навигация на экран выбора нового времени
    Alert.alert(t('upcomingAppointments.info'), t('upcomingAppointments.rescheduleInfo'));
  };

  const styles = StyleSheet.create({
    actionButton: {
      flex: 1,
      marginHorizontal: 4,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    appointmentCard: {
      marginBottom: 12,
    },
    appointmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    appointmentInfo: {
      marginVertical: 8,
    },
    appointmentsContainer: {
      padding: 16,
    },
    centeredContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    container: {
      flex: 1,
    },
    emptyCard: {
      marginHorizontal: 16,
    },
    emptyContainer: {
      alignItems: 'center',
    },
    emptyText: {
      color: theme.colors.text.secondary,
      marginTop: 12,
      textAlign: 'center',
    },
    errorText: {
      marginTop: 12,
      textAlign: 'center',
    },
    headerCard: {
      marginBottom: 8,
      padding: 20,
    },
    infoRow: {
      alignItems: 'center',
      flexDirection: 'row',
      marginTop: 8,
    },
    infoText: {
      marginLeft: 8,
    },
    loadingText: {
      marginTop: 12,
    },
    primaryText: {
      color: theme.colors.primary,
    },
    retryButton: {
      marginTop: 20,
    },
    secondaryText: {
      color: theme.colors.text.secondary,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statsContainer: {
      flexDirection: 'row',
      marginTop: 16,
    },
  });

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <Spinner size="large" />
        <Text variant="body" style={styles.loadingText}>
          {t('upcomingAppointments.loading')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="alert-circle" family="ionicons" size={64} color={theme.colors.danger} />
        <Text variant="body" style={[styles.errorText, { color: theme.colors.danger }]}>
          {error}
        </Text>
        <Button
          title={t('upcomingAppointments.retry')}
          onPress={fetchAppointments}
          variant="primary"
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card elevated={false} containerStyle={styles.headerCard}>
        <Text variant="heading">{t('upcomingAppointments.title')}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="heading" style={styles.primaryText}>
              {appointments.length}
            </Text>
            <Text variant="bodySmall" style={styles.secondaryText}>
              {t('upcomingAppointments.planned')}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="heading" style={styles.primaryText}>
              {appointments.filter(a => a.type === 'online').length}
            </Text>
            <Text variant="bodySmall" style={styles.secondaryText}>
              {t('upcomingAppointments.online')}
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.appointmentsContainer}>
        {appointments.length === 0 ? (
          <Card elevated containerStyle={styles.emptyCard}>
            <View style={styles.emptyContainer}>
              <Icon
                name="calendar-outline"
                family="ionicons"
                size={64}
                color={theme.colors.text.secondary}
              />
              <Text variant="body" style={styles.emptyText}>
                {t('upcomingAppointments.empty')}
              </Text>
            </View>
          </Card>
        ) : (
          appointments.map(appointment => (
            <Card key={appointment._id} containerStyle={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View>
                  <Text variant="subtitle">
                    {appointment.doctor.firstName} {appointment.doctor.lastName}
                  </Text>
                  <Text variant="bodySmall" style={styles.secondaryText}>
                    {appointment.doctor.specialty}
                  </Text>
                </View>
                <Badge
                  label={
                    appointment.type === 'online'
                      ? t('upcomingAppointments.online')
                      : t('upcomingAppointments.offline')
                  }
                  variant={appointment.type === 'online' ? 'primary' : 'secondary'}
                />
              </View>

              <View style={styles.appointmentInfo}>
                <View style={styles.infoRow}>
                  <Icon
                    name="calendar"
                    family="ionicons"
                    size={16}
                    color={theme.colors.text.secondary}
                  />
                  <Text variant="body" style={styles.infoText}>
                    {appointment.date} {t('upcomingAppointments.atTime')} {appointment.time}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon
                    name="business"
                    family="ionicons"
                    size={16}
                    color={theme.colors.text.secondary}
                  />
                  <Text variant="body" style={styles.infoText}>
                    {appointment.clinic.name}
                  </Text>
                </View>
                {appointment.type === 'offline' && (
                  <View style={styles.infoRow}>
                    <Icon
                      name="location"
                      family="ionicons"
                      size={16}
                      color={theme.colors.text.secondary}
                    />
                    <Text variant="body" style={styles.infoText}>
                      {appointment.clinic.address}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.actionsContainer}>
                <Button
                  title={t('upcomingAppointments.reschedule')}
                  variant="outline"
                  size="small"
                  leftIcon={
                    <Icon
                      name="calendar"
                      family="ionicons"
                      size={16}
                      color={theme.colors.primary}
                    />
                  }
                  style={styles.actionButton}
                  onPress={() => handleRescheduleAppointment(appointment._id)}
                />
                <Button
                  title={t('upcomingAppointments.cancel')}
                  variant="outline"
                  size="small"
                  leftIcon={
                    <Icon
                      name="close-circle"
                      family="ionicons"
                      size={16}
                      color={theme.colors.danger}
                    />
                  }
                  style={[styles.actionButton, { borderColor: theme.colors.danger }]}
                  onPress={() => handleCancelAppointment(appointment._id)}
                />
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default UpcomingAppointmentsScreen;
