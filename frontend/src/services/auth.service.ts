import { httpClient } from '@/lib/http-client';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
} from '@/types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return httpClient.post<AuthResponse>('/api/v1/auth/login', credentials);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return httpClient.post<AuthResponse>('/api/v1/tenants/register', data);
  },

  refresh: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    return httpClient.post<AuthResponse>('/api/v1/auth/refresh', data);
  },

  logout: async (): Promise<void> => {
    httpClient.clearAuthToken();
  },
};
