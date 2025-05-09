import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';

export interface AdminUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  isBlocked?: boolean;
  verified?: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationData {
  total: number;
  page: number;
  pages: number;
}

export interface GetUsersResponse {
  users: AdminUser[];
  pagination: PaginationData;
}

export interface AdminStats {
  totalUsers: number;
  usersByRole: {
    doctors: number;
    patients: number;
    admins: number;
  };
  clinics: number;
  appointments: number;
  medicalRecords: number;
  pendingReviews: number;
}

export interface UserSearchParams {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get<ApiResponse<AdminStats>>('/admin/stats');
    return response.data;
  },

  async getUsers(params: UserSearchParams = {}): Promise<AdminUser[]> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    const response = await apiClient.get<ApiResponse<{ users: AdminUser[] }>>(endpoint);
    return response.data.users;
  },

  async getUserById(id: string): Promise<AdminUser> {
    const response = await apiClient.get<ApiResponse<{ user: AdminUser }>>(`/admin/users/${id}`);
    return response.data.user;
  },

  async updateUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
    const response = await apiClient.put<ApiResponse<{ user: AdminUser }>>(
      `/admin/users/${id}`,
      data
    );
    return response.data.user;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  },

  async createUser(data: Omit<AdminUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> {
    const response = await apiClient.post<ApiResponse<{ user: AdminUser }>>('/admin/users', data);
    return response.data.user;
  },

  updateUserRole: async (userId: string, role: string): Promise<void> => {
    await apiClient.put<ApiResponse<void>>(`/admin/users/${userId}/role`, { role });
  },

  toggleUserStatus: async (userId: string, isBlocked: boolean): Promise<void> => {
    await apiClient.put<ApiResponse<void>>(`/admin/users/${userId}/status`, { isBlocked });
  },

  sendBroadcastNotification: async (params: {
    title: string;
    message: string;
    role?: string;
  }): Promise<void> => {
    await apiClient.post('/admin/notifications/broadcast', params);
  },

  verifyDoctor: async (doctorId: string, verified: boolean): Promise<void> => {
    await apiClient.put<ApiResponse<void>>(`/admin/doctors/${doctorId}/verify`, { verified });
  },
};

export const getUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}): Promise<GetUsersResponse> => {
  const response = await apiClient.get<ApiResponse<GetUsersResponse>>('/admin/users', { params });
  return response.data;
};

export const updateUserRole = async (userId: string, role: string): Promise<void> => {
  await apiClient.put<ApiResponse<void>>(`/admin/users/${userId}/role`, { role });
};

export const toggleUserStatus = async (userId: string, isBlocked: boolean): Promise<void> => {
  await apiClient.put<ApiResponse<void>>(`/admin/users/${userId}/status`, { isBlocked });
};

export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete<ApiResponse<void>>(`/admin/users/${userId}`);
};

export const verifyDoctor = async (userId: string, verified: boolean): Promise<void> => {
  await apiClient.put<ApiResponse<void>>(`/admin/doctors/${userId}/verify`, { verified });
};
