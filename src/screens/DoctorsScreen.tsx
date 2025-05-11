import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppNavigatorParamList } from '../navigation/AppNavigator';

// Типы для навигации
type DoctorsScreenNavigationProp = StackNavigationProp<AppNavigatorParamList>;

// Интерфейс доктора для отображения в списке
interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  photo: string;
  rating: number;
  experience: number;
  clinicName: string;
}

const DoctorsScreen: React.FC = () => {
  const navigation = useNavigation<DoctorsScreenNavigationProp>();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  // Список специальностей для фильтрации
  const specialties = [
    'Все',
    'Терапевт',
    'Кардиолог',
    'Невролог',
    'Офтальмолог',
    'Ортопед',
    'Педиатр',
  ];

  // Имитация загрузки данных о врачах
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Демо-данные
        const demoDoctors: Doctor[] = [
          {
            _id: '1',
            firstName: 'Елена',
            lastName: 'Петрова',
            specialty: 'Кардиолог',
            photo: 'https://randomuser.me/api/portraits/women/44.jpg',
            rating: 4.8,
            experience: 12,
            clinicName: 'Медицинский центр "Здоровье"',
          },
          {
            _id: '2',
            firstName: 'Александр',
            lastName: 'Иванов',
            specialty: 'Терапевт',
            photo: 'https://randomuser.me/api/portraits/men/32.jpg',
            rating: 4.6,
            experience: 8,
            clinicName: 'Городская клиника №2',
          },
          {
            _id: '3',
            firstName: 'Ольга',
            lastName: 'Смирнова',
            specialty: 'Невролог',
            photo: 'https://randomuser.me/api/portraits/women/67.jpg',
            rating: 4.9,
            experience: 15,
            clinicName: 'Неврологический центр',
          },
          {
            _id: '4',
            firstName: 'Дмитрий',
            lastName: 'Козлов',
            specialty: 'Офтальмолог',
            photo: 'https://randomuser.me/api/portraits/men/22.jpg',
            rating: 4.7,
            experience: 10,
            clinicName: 'Центр микрохирургии глаза',
          },
          {
            _id: '5',
            firstName: 'Наталья',
            lastName: 'Морозова',
            specialty: 'Педиатр',
            photo: 'https://randomuser.me/api/portraits/women/90.jpg',
            rating: 4.9,
            experience: 18,
            clinicName: 'Детская поликлиника №3',
          },
        ];

        setDoctors(demoDoctors);
        setFilteredDoctors(demoDoctors);
      } catch (error) {
        console.error('Ошибка при загрузке списка врачей:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Фильтрация врачей по поисковому запросу и специальности
  useEffect(() => {
    let filtered = doctors;

    // Фильтр по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        doctor =>
          doctor.firstName.toLowerCase().includes(query) ||
          doctor.lastName.toLowerCase().includes(query) ||
          doctor.specialty.toLowerCase().includes(query) ||
          doctor.clinicName.toLowerCase().includes(query)
      );
    }

    // Фильтр по специальности
    if (selectedSpecialty && selectedSpecialty !== 'Все') {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }

    setFilteredDoctors(filtered);
  }, [searchQuery, selectedSpecialty, doctors]);

  // Переход на экран с деталями доктора
  const handleDoctorPress = (doctor: Doctor) => {
    navigation.navigate('DoctorDetails', {
      doctorId: doctor._id,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
    });
  };

  // Рендер карточки доктора
  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => handleDoctorPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.photo }}
        style={styles.doctorPhoto}
        defaultSource={require('../assets/images/default-avatar.png')}
      />
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.specialty}>{item.specialty}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color={COLORS.palette.warning} />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.experience}>• Опыт {item.experience} лет</Text>
        </View>
        <View style={styles.clinicContainer}>
          <Ionicons name="business-outline" size={14} color={COLORS.light.text.secondary} />
          <Text style={styles.clinic} numberOfLines={1} ellipsizeMode="tail">
            {item.clinicName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Рендер фильтра специальностей
  const renderSpecialtyFilter = () => (
    <View style={styles.specialtyFilterContainer}>
      <FlatList
        data={specialties}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.specialtyItem,
              selectedSpecialty === item && styles.selectedSpecialtyItem,
              item === 'Все' && !selectedSpecialty && styles.selectedSpecialtyItem,
            ]}
            onPress={() => setSelectedSpecialty(item === 'Все' ? null : item)}
          >
            <Text
              style={[
                styles.specialtyText,
                (selectedSpecialty === item || (item === 'Все' && !selectedSpecialty)) &&
                  styles.selectedSpecialtyText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.light.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Врачи</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.light.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск врачей, специальностей, клиник"
          placeholderTextColor={COLORS.light.text.hint}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color={COLORS.light.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {renderSpecialtyFilter()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.light.primary} />
          <Text style={styles.loadingText}>Загрузка списка врачей...</Text>
        </View>
      ) : filteredDoctors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="medical" size={64} color={COLORS.light.text.secondary} />
          <Text style={styles.emptyText}>По вашему запросу не найдено ни одного врача</Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setSearchQuery('');
              setSelectedSpecialty(null);
            }}
          >
            <Text style={styles.resetButtonText}>Сбросить фильтры</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          renderItem={renderDoctorCard}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.doctorsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginRight: 16,
  },
  clinic: {
    color: COLORS.light.text.secondary,
    fontSize: 12,
    marginLeft: 4,
  },
  clinicContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  doctorCard: {
    backgroundColor: COLORS.light.surface,
    borderRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 12,
    shadowColor: COLORS.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    color: COLORS.light.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  doctorPhoto: {
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  doctorsList: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    color: COLORS.light.text.secondary,
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  experience: {
    color: COLORS.light.text.secondary,
    fontSize: 12,
    marginLeft: 8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.light.text.secondary,
    fontSize: 16,
    marginTop: 12,
  },
  rating: {
    color: COLORS.light.text.primary,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  resetButton: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resetButtonText: {
    color: COLORS.light.background,
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.light.surface,
    borderRadius: 10,
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    color: COLORS.light.text.primary,
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    padding: 4,
  },
  selectedSpecialtyItem: {
    backgroundColor: COLORS.light.primary,
    borderColor: COLORS.light.primary,
  },
  selectedSpecialtyText: {
    color: COLORS.light.background,
  },
  specialty: {
    color: COLORS.light.text.secondary,
    fontSize: 14,
    marginTop: 2,
  },
  specialtyFilterContainer: {
    marginBottom: 16,
    marginLeft: 16,
  },
  specialtyItem: {
    backgroundColor: COLORS.light.background,
    borderColor: COLORS.light.border,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  specialtyText: {
    color: COLORS.light.text.primary,
    fontSize: 14,
  },
  title: {
    color: COLORS.light.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default DoctorsScreen;
