import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

// Константы цветов для использования в стилях
const STYLE_COLORS = {
  background: '#f5f5f5',
  white: '#fff',
  border: '#e0e0e0',
  text: {
    primary: '#333',
    secondary: '#666',
  },
  input: '#f9f9f9',
  modalBackground: 'rgba(0, 0, 0, 0.5)',
  buttonBackground: '#f0f0f0',
  lightBorder: '#f0f0f0',
  transparent: 'transparent',
};

// Интерфейсы для типизации данных
interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  appointmentsCount: number;
  isActive: boolean;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

// Моковые данные для примера
const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Иванов Иван Иванович',
    specialization: 'Терапевт',
    experience: 10,
    rating: 4.8,
    appointmentsCount: 250,
    isActive: true,
  },
  {
    id: '2',
    name: 'Петрова Мария Сергеевна',
    specialization: 'Кардиолог',
    experience: 15,
    rating: 4.9,
    appointmentsCount: 320,
    isActive: true,
  },
  {
    id: '3',
    name: 'Сидоров Алексей Петрович',
    specialization: 'Невролог',
    experience: 8,
    rating: 4.7,
    appointmentsCount: 180,
    isActive: true,
  },
  {
    id: '4',
    name: 'Козлова Елена Владимировна',
    specialization: 'Эндокринолог',
    experience: 12,
    rating: 4.6,
    appointmentsCount: 210,
    isActive: false,
  },
  {
    id: '5',
    name: 'Смирнов Дмитрий Александрович',
    specialization: 'Хирург',
    experience: 18,
    rating: 4.9,
    appointmentsCount: 290,
    isActive: true,
  },
];

const MOCK_ROLES: Role[] = [
  {
    id: '1',
    name: 'Администратор',
    permissions: [
      'Управление персоналом',
      'Управление расписанием',
      'Финансовая отчетность',
      'Управление клиникой',
    ],
  },
  {
    id: '2',
    name: 'Врач',
    permissions: ['Просмотр расписания', 'Ведение приемов', 'Доступ к медицинским картам'],
  },
  {
    id: '3',
    name: 'Медсестра',
    permissions: ['Помощь врачу', 'Базовый доступ к расписанию'],
  },
  {
    id: '4',
    name: 'Регистратор',
    permissions: ['Регистрация пациентов', 'Управление записями на прием'],
  },
];

const StaffManagementScreen: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const navigation = useNavigation();

  // Состояния
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddDoctorModalVisible, setIsAddDoctorModalVisible] = useState<boolean>(false);
  const [isEditRoleModalVisible, setIsEditRoleModalVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'doctors' | 'roles'>('doctors');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Поля формы для добавления врача
  const [newDoctorName, setNewDoctorName] = useState<string>('');
  const [newDoctorSpecialization, setNewDoctorSpecialization] = useState<string>('');
  const [newDoctorExperience, setNewDoctorExperience] = useState<string>('');

  // Поиск врачей
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = doctors.filter(
        doctor =>
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialization.toLowerCase().includes(query)
      );
      setFilteredDoctors(filtered);
    }
  }, [searchQuery, doctors]);

  // Обработчики событий
  const handleAddDoctor = () => {
    // Валидация
    if (!newDoctorName.trim() || !newDoctorSpecialization.trim() || !newDoctorExperience.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    const experience = parseInt(newDoctorExperience, 10);
    if (isNaN(experience) || experience <= 0) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректное значение стажа');
      return;
    }

    // Создание нового врача
    const newDoctor: Doctor = {
      id: (doctors.length + 1).toString(),
      name: newDoctorName.trim(),
      specialization: newDoctorSpecialization.trim(),
      experience,
      rating: 0,
      appointmentsCount: 0,
      isActive: true,
    };

    // Добавление в список
    setDoctors([...doctors, newDoctor]);

    // Сброс формы
    setNewDoctorName('');
    setNewDoctorSpecialization('');
    setNewDoctorExperience('');
    setIsAddDoctorModalVisible(false);

    Alert.alert('Успешно', 'Врач добавлен в систему');
  };

  const handleToggleDoctorStatus = (doctorId: string) => {
    const updatedDoctors = doctors.map(doctor => {
      if (doctor.id === doctorId) {
        return { ...doctor, isActive: !doctor.isActive };
      }
      return doctor;
    });

    setDoctors(updatedDoctors);
  };

  const handleDeleteDoctor = (doctorId: string) => {
    Alert.alert('Подтверждение', 'Вы уверены, что хотите удалить этого врача?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          const updatedDoctors = doctors.filter(doctor => doctor.id !== doctorId);
          setDoctors(updatedDoctors);
        },
      },
    ]);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditRoleModalVisible(true);
  };

  const handleSaveRole = () => {
    if (!selectedRole) return;

    // В реальном приложении здесь будет обновление роли на сервере

    setIsEditRoleModalVisible(false);
    setSelectedRole(null);

    Alert.alert('Успешно', 'Роль обновлена');
  };

  // Отрисовка элемента списка врачей
  const renderDoctorItem = ({ item }: { item: Doctor }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.doctorSpecialization}>{item.specialization}</Text>
        <View style={styles.doctorDetails}>
          <View style={styles.doctorDetail}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.experience} лет опыта</Text>
          </View>
          <View style={styles.doctorDetail}>
            <Ionicons name="star" size={16} color={COLORS.light.warning} />
            <Text style={styles.detailText}>{item.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.doctorDetail}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>{item.appointmentsCount} приемов</Text>
          </View>
        </View>
      </View>

      <View style={styles.doctorActions}>
        <TouchableOpacity
          style={[
            styles.statusBadge,
            { backgroundColor: item.isActive ? COLORS.light.success : COLORS.light.error },
          ]}
          onPress={() => handleToggleDoctorStatus(item.id)}
        >
          <Text style={styles.statusText}>{item.isActive ? 'Активен' : 'Неактивен'}</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // @ts-expect-error - навигационные типы требуют уточнения
              navigation.navigate('DoctorSchedule', { doctorId: item.id });
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.light.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // @ts-expect-error - навигационные типы требуют уточнения
              navigation.navigate('DoctorProfile', { doctorId: item.id });
            }}
          >
            <Ionicons name="person-outline" size={20} color={COLORS.light.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteDoctor(item.id)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.light.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Отрисовка элемента списка ролей
  const renderRoleItem = ({ item }: { item: Role }) => (
    <TouchableOpacity style={styles.roleCard} onPress={() => handleEditRole(item)}>
      <View style={styles.roleHeader}>
        <Text style={styles.roleName}>{item.name}</Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>

      <View style={styles.permissionsContainer}>
        {item.permissions.map((permission, index) => (
          <View key={index} style={styles.permissionItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.light.success} />
            <Text style={styles.permissionText}>{permission}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Управление персоналом</Text>
      </View>

      {/* Вкладки */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'doctors' && styles.activeTab]}
          onPress={() => setActiveTab('doctors')}
        >
          <Text style={[styles.tabText, activeTab === 'doctors' && styles.activeTabText]}>
            Врачи
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'roles' && styles.activeTab]}
          onPress={() => setActiveTab('roles')}
        >
          <Text style={[styles.tabText, activeTab === 'roles' && styles.activeTabText]}>
            Роли и права
          </Text>
        </TouchableOpacity>
      </View>

      {/* Содержимое вкладки "Врачи" */}
      {activeTab === 'doctors' && (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Поиск врачей..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAddDoctorModalVisible(true)}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={styles.loader} size="large" color={COLORS.light.primary} />
          ) : (
            <FlatList
              data={filteredDoctors}
              renderItem={renderDoctorItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? 'Не найдено врачей, соответствующих запросу'
                    : 'Нет доступных врачей'}
                </Text>
              }
            />
          )}
        </>
      )}

      {/* Содержимое вкладки "Роли и права" */}
      {activeTab === 'roles' && (
        <FlatList
          data={roles}
          renderItem={renderRoleItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Модальное окно добавления врача */}
      <Modal
        visible={isAddDoctorModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddDoctorModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Добавить врача</Text>
              <TouchableOpacity onPress={() => setIsAddDoctorModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ФИО</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Введите ФИО врача"
                  value={newDoctorName}
                  onChangeText={setNewDoctorName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Специализация</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Введите специализацию"
                  value={newDoctorSpecialization}
                  onChangeText={setNewDoctorSpecialization}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Стаж (лет)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Введите стаж работы"
                  value={newDoctorExperience}
                  onChangeText={setNewDoctorExperience}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddDoctor}>
              <Text style={styles.submitButtonText}>Добавить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Модальное окно редактирования роли */}
      <Modal
        visible={isEditRoleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditRoleModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Редактирование роли: {selectedRole?.name}</Text>
              <TouchableOpacity onPress={() => setIsEditRoleModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.permissionsSection}>
              <Text style={styles.permissionsSectionTitle}>Разрешения</Text>

              {selectedRole?.permissions.map((permission, index) => (
                <View key={index} style={styles.permissionEditItem}>
                  <Text style={styles.permissionEditText}>{permission}</Text>
                  <TouchableOpacity>
                    <Ionicons name="trash-outline" size={20} color={COLORS.light.error} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addPermissionButton}>
                <Ionicons name="add-circle" size={24} color={COLORS.light.primary} />
                <Text style={styles.addPermissionText}>Добавить разрешение</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSaveRole}>
              <Text style={styles.submitButtonText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: STYLE_COLORS.buttonBackground,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginLeft: 8,
    width: 36,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  activeTab: {
    borderBottomColor: COLORS.light.primary,
  },
  activeTabText: {
    color: COLORS.light.primary,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginLeft: 10,
    width: 40,
  },
  addPermissionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 15,
  },
  addPermissionText: {
    color: COLORS.light.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  container: {
    backgroundColor: STYLE_COLORS.background,
    flex: 1,
  },
  detailText: {
    color: STYLE_COLORS.text.secondary,
    fontSize: 14,
    marginLeft: 5,
  },
  doctorActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  doctorCard: {
    backgroundColor: STYLE_COLORS.white,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 10,
    padding: 15,
    shadowColor: COLORS.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  doctorDetail: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 15,
    marginTop: 5,
  },
  doctorDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  doctorInfo: {
    marginBottom: 10,
  },
  doctorName: {
    color: STYLE_COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  doctorSpecialization: {
    color: STYLE_COLORS.text.secondary,
    fontSize: 14,
    marginTop: 2,
  },
  emptyText: {
    color: STYLE_COLORS.text.secondary,
    fontSize: 16,
    marginTop: 50,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  formInput: {
    backgroundColor: STYLE_COLORS.input,
    borderColor: STYLE_COLORS.border,
    borderRadius: 5,
    borderWidth: 1,
    fontSize: 16,
    padding: 10,
  },
  formLabel: {
    color: STYLE_COLORS.text.secondary,
    fontSize: 14,
    marginBottom: 5,
  },
  header: {
    backgroundColor: STYLE_COLORS.white,
    borderBottomColor: STYLE_COLORS.border,
    borderBottomWidth: 1,
    padding: 20,
  },
  listContainer: {
    padding: 10,
  },
  loader: {
    marginTop: 50,
  },
  modalContainer: {
    alignItems: 'center',
    backgroundColor: STYLE_COLORS.modalBackground,
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: STYLE_COLORS.white,
    borderRadius: 10,
    elevation: 5,
    padding: 20,
    shadowColor: COLORS.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '90%',
  },
  modalForm: {
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    color: STYLE_COLORS.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionEditItem: {
    alignItems: 'center',
    borderBottomColor: STYLE_COLORS.lightBorder,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  permissionEditText: {
    color: STYLE_COLORS.text.primary,
    fontSize: 14,
  },
  permissionItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 5,
  },
  permissionText: {
    color: STYLE_COLORS.text.secondary,
    fontSize: 14,
    marginLeft: 8,
  },
  permissionsContainer: {
    marginTop: 5,
  },
  permissionsSection: {
    marginBottom: 20,
  },
  permissionsSectionTitle: {
    color: STYLE_COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  roleCard: {
    backgroundColor: STYLE_COLORS.white,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 10,
    padding: 15,
    shadowColor: COLORS.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  roleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  roleName: {
    color: STYLE_COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: STYLE_COLORS.buttonBackground,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    height: 40,
    paddingHorizontal: 10,
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: STYLE_COLORS.white,
    borderBottomColor: STYLE_COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 40,
  },
  statusBadge: {
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: STYLE_COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 5,
    padding: 12,
  },
  submitButtonText: {
    color: STYLE_COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  tab: {
    alignItems: 'center',
    borderBottomColor: STYLE_COLORS.transparent,
    borderBottomWidth: 2,
    flex: 1,
    paddingVertical: 15,
  },
  tabContainer: {
    backgroundColor: STYLE_COLORS.white,
    flexDirection: 'row',
    marginBottom: 10,
  },
  tabText: {
    color: STYLE_COLORS.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    color: COLORS.light.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default StaffManagementScreen;
