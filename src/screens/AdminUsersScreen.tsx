import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api/admin';
import { useNavigation } from '@react-navigation/native';
import { User } from '../types/models';
import { ApiResponse, PaginationData } from '../types/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { themes } from '../theme/theme';
import { COLORS } from '../theme/colors';

type AdminUsersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminUsers'>;

interface UsersResponse {
  users: User[];
  pagination?: PaginationData;
}

export const AdminUsersScreen: React.FC = () => {
  const { isDark } = useTheme();
  const theme = isDark ? themes.dark : themes.light;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    pages: 1,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const navigation = useNavigation<AdminUsersScreenNavigationProp>();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = (await adminApi.getUsers({
        page: pagination.page,
        limit: 10,
        search: searchTerm || undefined,
        role: roleFilter || undefined,
      })) as unknown as ApiResponse<UsersResponse>;

      console.log('AdminUsersScreen.loadUsers: Получен ответ API', {
        hasUsers: !!response?.data?.users,
        userCount: response?.data?.users?.length || 0,
        hasValidPagination: !!response?.data?.pagination,
        responseType: typeof response,
      });

      if (response?.data?.users) {
        setUsers(response.data.users);
      }

      if (response?.data?.pagination) {
        setPagination(response.data.pagination);
        console.log('AdminUsersScreen.loadUsers: Пагинация обновлена', response.data.pagination);
      }
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
      Alert.alert(t('common.error'), t('admin.users.loadError'), [{ text: t('common.ok') }]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, searchTerm, roleFilter, t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = () => {
    // Сбрасываем страницу на первую при новом поиске
    setPagination({
      ...pagination,
      page: 1,
    });
    loadUsers();
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      setLoading(true);
      await adminApi.updateUserRole(userId, newRole);
      Alert.alert(t('common.success'), t('admin.successUpdate'));
      loadUsers();
    } catch (error) {
      console.error('Ошибка при обновлении роли:', error);
      Alert.alert(t('common.error'), t('admin.errorUpdate'));
    } finally {
      setLoading(false);
      setIsRoleModalVisible(false);
    }
  };

  const handleToggleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      setLoading(true);
      await adminApi.toggleUserStatus(userId, isBlocked);
      Alert.alert(
        t('common.success'),
        isBlocked ? t('admin.userBlocked') : t('admin.userUnblocked')
      );
      loadUsers();
    } catch (error) {
      console.error('Ошибка при блокировке/разблокировке пользователя:', error);
      Alert.alert(t('common.error'), t('admin.errorUpdate'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      Alert.alert(t('admin.confirm'), t('admin.deleteConfirmation'), [
        { text: t('admin.cancel'), style: 'cancel' },
        {
          text: t('admin.delete'),
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await adminApi.deleteUser(userId);
            Alert.alert(t('common.success'), t('admin.successDelete'));
            loadUsers();
            setLoading(false);
          },
        },
      ]);
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      Alert.alert(t('common.error'), t('admin.errorDelete'));
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={[styles.userCard, item.isBlocked && styles.disabledButton]}>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.text.secondary }]}>{item.email}</Text>
        <View style={styles.userMeta}>
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.badgeText, { color: theme.colors.white }]}>{item.role}</Text>
          </View>
          {item.isBlocked && (
            <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
              <Text style={[styles.badgeText, { color: theme.colors.white }]}>
                {t('admin.blocked')}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setSelectedUser(item);
            setIsRoleModalVisible(true);
          }}
        >
          <Text style={styles.actionButtonText}>{t('admin.changeRole')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: item.isBlocked ? theme.colors.success : theme.colors.error },
          ]}
          onPress={() => handleToggleBlockUser(item._id, !item.isBlocked)}
        >
          <Text style={styles.actionButtonText}>
            {item.isBlocked ? t('admin.unblock') : t('admin.block')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={() => handleDeleteUser(item._id)}
        >
          <Text style={styles.actionButtonText}>{t('admin.delete')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setSelectedUser(item);
            setIsDetailsModalVisible(true);
          }}
        >
          <Text style={styles.actionButtonText}>{t('admin.details')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const RoleModal = () => (
    <Modal
      visible={isRoleModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsRoleModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
            {t('admin.selectRole')}
          </Text>

          <TouchableOpacity
            style={[styles.roleOption, { backgroundColor: theme.colors.primary }]}
            onPress={() => selectedUser && handleUpdateRole(selectedUser._id, 'admin')}
          >
            <Text style={styles.roleOptionText}>{t('admin.administrator')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleOption, { backgroundColor: theme.colors.primary }]}
            onPress={() => selectedUser && handleUpdateRole(selectedUser._id, 'doctor')}
          >
            <Text style={styles.roleOptionText}>{t('admin.doctor')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleOption, { backgroundColor: theme.colors.primary }]}
            onPress={() => selectedUser && handleUpdateRole(selectedUser._id, 'patient')}
          >
            <Text style={styles.roleOptionText}>{t('admin.patient')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.colors.error }]}
            onPress={() => setIsRoleModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>{t('admin.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const UserDetailsModal = () => (
    <Modal
      visible={isDetailsModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsDetailsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          {selectedUser && (
            <>
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
                {t('admin.userDetails')}
              </Text>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                  {t('admin.id')}:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                  {selectedUser._id}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                  {t('admin.name')}:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                  {selectedUser.firstName} {selectedUser.lastName}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                  {t('admin.email')}:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                  {selectedUser.email}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                  {t('admin.role')}:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                  {selectedUser.role}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                  {t('admin.status')}:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                  {selectedUser.isBlocked ? t('admin.blocked') : t('admin.active')}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                  {t('admin.verification')}:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                  {selectedUser.isVerified ? t('admin.verified') : t('admin.notVerified')}
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setIsDetailsModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>{t('admin.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
    </View>
  );

  const Pagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationButton, pagination.page <= 1 ? { opacity: 0.5 } : { opacity: 1 }]}
        onPress={() => {
          if (pagination.page > 1) {
            setPagination({
              ...pagination,
              page: pagination.page - 1,
            });
          }
        }}
        disabled={pagination.page <= 1}
      >
        <Ionicons name="chevron-back" size={20} color={theme.colors.text.primary} />
      </TouchableOpacity>

      <Text style={[styles.paginationText, { color: theme.colors.text.primary }]}>
        {t('admin.page')} {pagination.page} {t('admin.of')} {pagination.pages}
      </Text>

      <TouchableOpacity
        style={[
          styles.paginationButton,
          pagination.page >= pagination.pages ? { opacity: 0.5 } : { opacity: 1 },
        ]}
        onPress={() => {
          if (pagination.page < pagination.pages) {
            setPagination({
              ...pagination,
              page: pagination.page + 1,
            });
          }
        }}
        disabled={pagination.page >= pagination.pages}
      >
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>{t('admin.users')}</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: theme.colors.surface, color: theme.colors.text.primary },
          ]}
          placeholder={t('admin.searchUsers')}
          placeholderTextColor={theme.colors.text.secondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSearch}
        >
          <Ionicons name="search" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {['admin', 'doctor', 'patient', null].map(role => (
          <TouchableOpacity
            key={role || 'all'}
            style={[
              styles.filterButton,
              roleFilter === role
                ? { backgroundColor: theme.colors.primary }
                : { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => setRoleFilter(role)}
          >
            <Text
              style={[
                styles.filterButtonText,
                roleFilter === role
                  ? { color: COLORS.palette.white }
                  : { color: theme.colors.text.primary },
              ]}
            >
              {role ? t(`admin.roles.${role}`) : t('admin.allUsers')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.doctorRequestsButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('DoctorRequests')}
      >
        <Ionicons name="medkit" size={20} color={theme.colors.white} />
        <Text style={styles.doctorRequestsButtonText}>{t('admin.doctorRequests')}</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.usersList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.text.secondary} />
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
              {t('admin.noUsersFound')}
            </Text>
          </View>
        }
        ListFooterComponent={loading ? <LoadingIndicator /> : pagination && <Pagination />}
      />

      <RoleModal />
      <UserDetailsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 4,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionButtonText: {
    color: COLORS.palette.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  badge: {
    borderRadius: 12,
    marginBottom: 4,
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelButton: {
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: COLORS.palette.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailValue: {
    flex: 2,
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  doctorRequestsButton: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    padding: 12,
  },
  doctorRequestsButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  filterButton: {
    borderColor: '#ddd',
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterButtonText: {
    fontSize: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    borderRadius: 8,
    elevation: 5,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '90%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  paginationButton: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginHorizontal: 8,
    width: 32,
  },
  paginationContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  paginationText: {
    marginHorizontal: 16,
  },
  roleOption: {
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 12,
  },
  roleOptionText: {
    color: COLORS.palette.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    borderRadius: 8,
    flex: 1,
    height: 40,
    marginRight: 8,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userCard: {
    borderRadius: 8,
    elevation: 2,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  userInfo: {
    marginBottom: 12,
  },
  userMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  usersList: {
    flexGrow: 1,
  },
});
