import { httpClient } from '@/lib/http-client';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
} from '@/types';

// Backend API response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await httpClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await httpClient.post<ApiResponse<AuthResponse>>('/api/v1/tenants/register', data);
    return response.data;
  },

  refresh: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await httpClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/refresh', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    httpClient.clearAuthToken();
  },
};
