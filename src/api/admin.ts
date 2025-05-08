import { apiClient } from './apiClient';

export interface User {
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
  users: User[];
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
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  async getUsers(params: UserSearchParams = {}): Promise<User[]> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    const response = await apiClient.get<User[]>(endpoint);
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(`/admin/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  },

  async createUser(data: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const response = await apiClient.post<User>('/admin/users', data);
    return response.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  toggleUserStatus: async (userId: string, isBlocked: boolean): Promise<User> => {
    const response = await apiClient.put(`/admin/users/${userId}/status`, { isBlocked });
    return response.data;
  },

  sendBroadcastNotification: async (params: {
    title: string;
    message: string;
    role?: string;
  }): Promise<void> => {
    await apiClient.post('/admin/notifications/broadcast', params);
  },
  
  verifyDoctor: async (doctorId: string, verified: boolean): Promise<void> => {
    await apiClient.put(`/admin/doctors/${doctorId}/verify`, { verified });
  }
};
