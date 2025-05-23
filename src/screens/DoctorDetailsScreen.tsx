import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

// Импорт компонентов из атомарной дизайн-системы
import { Text } from '../components/ui/atoms/Text';
import { Avatar } from '../components/ui/atoms/Avatar';
import { Button } from '../components/ui/atoms/Button';
import { Icon } from '../components/ui/atoms/Icon';
import { Spinner } from '../components/ui/atoms/Spinner';
import { Card } from '../components/ui/atoms/Card';
import { IconButton } from '../components/ui/molecules/IconButton';
import { ListItem } from '../components/ui/molecules/ListItem';
import { COLORS } from '../theme/colors';

// Заглушка данных о враче
interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  photo: string;
  experience: number;
  rating: number;
  education: string;
  certifications: string[];
  about: string;
  clinic: {
    _id: string;
    name: string;
    address: string;
  };
  services: string[];
}

type DoctorDetailsScreenRouteProp = RouteProp<RootStackParamList, 'DoctorDetails'>;
type DoctorDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DoctorDetails'
>;

const DoctorDetailsScreen: React.FC = () => {
  const navigation = useNavigation<DoctorDetailsScreenNavigationProp>();
  const route = useRoute<DoctorDetailsScreenRouteProp>();
  const { doctorId } = route.params;
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const { t } = useTranslation();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  // Имитация загрузки данных о враче с сервера
  useEffect(() => {
    // В реальном приложении здесь будет API запрос
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        // Имитация задержки сети
        await new Promise((resolve: (value: void) => void) => setTimeout(resolve, 1000));

        // Демо-данные
        const demoDoctor: Doctor = {
          _id: doctorId,
          firstName: 'Елена',
          lastName: 'Петрова',
          specialty: 'Кардиолог',
          photo: 'https://randomuser.me/api/portraits/women/44.jpg',
          experience: 12,
          rating: 4.8,
          education: 'Московский государственный медицинский университет имени И.М. Сеченова',
          certifications: [
            'Сертификат по кардиологии, 2015',
            'Сертификат по функциональной диагностике, 2017',
          ],
          about:
            'Опытный кардиолог с 12-летним стажем работы. Специализируется на диагностике и лечении заболеваний сердечно-сосудистой системы. Активно применяет современные методы диагностики.',
          clinic: {
            _id: '123456',
            name: 'Медицинский центр "Здоровье"',
            address: 'ул. Ленина, 10, Москва',
          },
          services: [
            'Консультация кардиолога',
            'ЭКГ',
            'Эхокардиография',
            'Холтер ЭКГ',
            'Суточный мониторинг АД',
          ],
        };

        setDoctor(demoDoctor);
      } catch (error) {
        console.error('Ошибка при загрузке данных о враче:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  const handleBookAppointment = () => {
    if (!doctor) return;

    navigation.navigate('BookAppointment', {
      doctorId: doctor._id,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      specialty: doctor.specialty,
      clinicId: doctor.clinic._id,
      clinicName: doctor.clinic.name,
      clinicAddress: doctor.clinic.address,
    });
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <Spinner size="large" />
        <Text style={styles.loadingText}>{t('doctorDetails.loading')}</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <Card style={styles.errorCard}>
        <Icon name="alert-circle" family="ionicons" size={64} color={theme.danger} />
        <Text style={[styles.errorText, { color: theme.danger }]}>{t('doctorDetails.error')}</Text>
        <Button
          title={t('doctorDetails.goBack')}
          onPress={() => navigation.goBack()}
          variant="primary"
          style={styles.backButton}
        />
      </Card>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <IconButton
            name="arrow-back"
            family="ionicons"
            size="small"
            variant="ghost"
            onPress={() => navigation.goBack()}
          />
        </View>

        <Card style={styles.doctorCard}>
          <View style={styles.doctorCardContent}>
            <Avatar
              size="large"
              source={{ uri: doctor.photo }}
              name={`${doctor.firstName} ${doctor.lastName}`}
            />
            <View style={styles.doctorInfo}>
              <Text
                variant="title"
                style={styles.doctorName}
              >{`${doctor.firstName} ${doctor.lastName}`}</Text>
              <Text style={[styles.specialtyText, { color: theme.text.secondary }]}>
                {doctor.specialty}
              </Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" family="ionicons" size={16} color={theme.warning} />
                <Text style={styles.ratingText}>{doctor.rating}</Text>
                <Text style={[styles.experienceText, { color: theme.text.secondary }]}>
                  • {t('doctorDetails.experience', { years: doctor.experience })}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.sectionContent}>
            <Text variant="subheading" style={styles.sectionTitle}>
              {t('doctorDetails.about')}
            </Text>
            <Text style={styles.sectionText}>{doctor.about}</Text>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.sectionContent}>
            <Text variant="subheading" style={styles.sectionTitle}>
              {t('doctorDetails.education')}
            </Text>
            <Text style={styles.sectionText}>{doctor.education}</Text>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.sectionContent}>
            <Text variant="subheading" style={styles.sectionTitle}>
              {t('doctorDetails.certificates')}
            </Text>
            {doctor.certifications.map((cert, index) => (
              <ListItem
                key={index}
                title={cert}
                leftContent={
                  <Icon
                    name="document-text-outline"
                    family="ionicons"
                    size={20}
                    color={theme.primary}
                  />
                }
                showDivider={index !== doctor.certifications.length - 1}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.sectionContent}>
            <Text variant="subheading" style={styles.sectionTitle}>
              {t('doctorDetails.clinic')}
            </Text>
            <ListItem
              title={doctor.clinic.name}
              subtitle={doctor.clinic.address}
              leftContent={
                <Icon name="business-outline" family="ionicons" size={20} color={theme.primary} />
              }
              onPress={() =>
                navigation.navigate('ClinicDetails', {
                  clinicId: doctor.clinic._id,
                })
              }
            />
          </View>
        </Card>

        <Card style={styles.lastCard}>
          <View style={styles.sectionContent}>
            <Text variant="subheading" style={styles.sectionTitle}>
              {t('doctorDetails.services')}
            </Text>
            {doctor.services.map((service, index) => (
              <ListItem
                key={index}
                title={service}
                leftContent={
                  <Icon name="medical-outline" family="ionicons" size={20} color={theme.primary} />
                }
                showDivider={index !== doctor.services.length - 1}
              />
            ))}
          </View>
        </Card>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
        ]}
      >
        <Button
          title={t('doctorDetails.bookAppointment')}
          leftIcon={<Icon name="calendar-outline" family="ionicons" size={20} color="white" />}
          onPress={handleBookAppointment}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginTop: 16,
  },
  centeredContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  doctorCard: {
    margin: 16,
  },
  doctorCardContent: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 16,
  },
  doctorName: {
    fontSize: 20,
  },
  errorCard: {
    alignItems: 'center',
    margin: 20,
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    textAlign: 'center',
  },
  experienceText: {
    marginLeft: 8,
  },
  footer: {
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
  },
  lastCard: {
    margin: 16,
    marginBottom: 100,
    marginTop: 0,
  },
  loadingText: {
    marginTop: 12,
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  ratingText: {
    fontWeight: '500',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  sectionContent: {
    padding: 16,
  },
  sectionText: {
    lineHeight: 22,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  specialtyText: {
    marginTop: 2,
  },
});

export default DoctorDetailsScreen;
