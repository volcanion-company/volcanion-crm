import { httpClient } from '@/lib/http-client';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  PaginatedResponse,
  PaginationParams,
  UserStatus,
} from '@/types';

// Backend API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Backend uses different field names for pagination
interface BackendPaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface UserListParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
  search?: string;
  status?: UserStatus;
}

export const userService = {
  // Get all users with pagination and filters
  async getUsers(
    params?: PaginationParams & {
      pageNumber?: number;
      status?: UserStatus;
      search?: string;
    }
  ): Promise<PaginatedResponse<User>> {
    const backendParams: UserListParams = {
      pageNumber: params?.pageNumber || params?.page || 1,
      pageSize: params?.pageSize || 10,
      search: params?.search,
      status: params?.status,
    };

    const response = await httpClient.get<ApiResponse<BackendPaginatedResponse<User>>>('/api/v1/users', backendParams);
    
    // Convert backend response to frontend format
    return {
      items: response.data.items,
      page: response.data.pageNumber,
      pageSize: response.data.pageSize,
      totalPages: response.data.totalPages,
      totalCount: response.data.totalCount,
      hasPreviousPage: response.data.hasPreviousPage,
      hasNextPage: response.data.hasNextPage,
    };
  },

  // Get single user by ID
  async getUser(id: string): Promise<User> {
    const response = await httpClient.get<ApiResponse<User>>(`/api/v1/users/${id}`);
    return response.data;
  },

  // Create new user
  async createUser(data: CreateUserRequest): Promise<User> {
    // Clean up empty optional fields
    const cleanedData = { ...data };
    
    Object.keys(cleanedData).forEach(key => {
      const value = cleanedData[key as keyof CreateUserRequest];
      if (value === '' || value === undefined) {
        delete cleanedData[key as keyof CreateUserRequest];
      }
    });
    
    const response = await httpClient.post<ApiResponse<User>>('/api/v1/users', cleanedData);
    return response.data;
  },

  // Update existing user
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    // Clean up empty optional fields
    const cleanedData = { ...data };
    
    Object.keys(cleanedData).forEach(key => {
      const value = cleanedData[key as keyof UpdateUserRequest];
      if (value === '' || value === undefined) {
        delete cleanedData[key as keyof UpdateUserRequest];
      }
    });
    
    const response = await httpClient.put<ApiResponse<User>>(`/api/v1/users/${id}`, cleanedData);
    return response.data;
  },

  // Activate user
  async activateUser(id: string): Promise<void> {
    await httpClient.post<ApiResponse<void>>(`/api/v1/users/${id}/activate`);
  },

  // Deactivate user
  async deactivateUser(id: string): Promise<void> {
    await httpClient.post<ApiResponse<void>>(`/api/v1/users/${id}/deactivate`);
  },

  // Reset password (Admin)
  async resetPassword(id: string): Promise<string> {
    const response = await httpClient.post<ApiResponse<string>>(`/api/v1/users/${id}/reset-password`);
    return response.data; // Returns new temporary password
  },

  // Change password (Self)
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await httpClient.post<ApiResponse<void>>('/api/v1/users/change-password', data);
  },

  // Delete user (soft delete)
  async deleteUser(id: string): Promise<void> {
    await httpClient.delete<ApiResponse<void>>(`/api/v1/users/${id}`);
  },
};
