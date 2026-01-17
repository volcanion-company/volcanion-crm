import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { authApi } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { httpClient } from '@/lib/http-client';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types';

export const useLogin = () => {
  const { setUser, setTenantId } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data: AuthResponse) => {
      httpClient.setAuthToken(data.token, data.refreshToken, data.expiresIn);
      setTenantId(data.tenantId);
      if (data.user) {
        setUser(data.user);
      }
      window.location.href = '/dashboard';
    },
  });
};

export const useRegister = () => {
  const { setUser, setTenantId } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data: AuthResponse) => {
      httpClient.setAuthToken(data.token, data.refreshToken, data.expiresIn);
      setTenantId(data.tenantId);
      if (data.user) {
        setUser(data.user);
      }
      window.location.href = '/dashboard';
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      window.location.href = '/auth/login';
    },
  });
};

export const useCurrentUser = (options?: UseQueryOptions<AuthResponse>) => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => Promise.resolve({ user } as AuthResponse),
    enabled: !!user,
    ...options,
  });
};
