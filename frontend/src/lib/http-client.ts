import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '@/config/constants';
import { ApiError } from '@/types';

class HttpClient {
  private client: AxiosInstance;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        
        if (token && this.shouldRefreshToken()) {
          try {
            const newToken = await this.refreshToken();
            config.headers.Authorization = `Bearer ${newToken}`;
          } catch (error) {
            console.error('[HTTP] Token refresh failed:', error);
            this.clearAuth();
            return Promise.reject(error);
          }
        } else if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        console.error('[HTTP] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        console.error('[HTTP] Response error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          responseData: error.response?.data
        });
        
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            console.error('[HTTP] Token refresh failed after 401:', refreshError);
            this.clearAuth();
            
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    // Validate token is not empty or invalid string
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
      return null;
    }
    return token;
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    // Validate token is not empty or invalid string
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
      return null;
    }
    return token;
  }

  private shouldRefreshToken(): boolean {
    if (typeof window === 'undefined') return false;
    const expiresAt = localStorage.getItem(AUTH_CONFIG.EXPIRES_AT_KEY);
    if (!expiresAt) return false;
    
    const expiryTime = parseInt(expiresAt, 10);
    const now = Date.now();
    
    return now > expiryTime - API_CONFIG.TOKEN_REFRESH_BUFFER;
  }

  private async refreshToken(): Promise<string> {
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/api/auth/refresh`,
          { refreshToken },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, accessToken);
          localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, newRefreshToken);
          localStorage.setItem(
            AUTH_CONFIG.EXPIRES_AT_KEY,
            String(Date.now() + expiresIn * 1000)
          );
        }

        return accessToken;
      } finally {
        this.tokenRefreshPromise = null;
      }
    })();

    return this.tokenRefreshPromise;
  }

  private clearAuth() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.TENANT_KEY);
    localStorage.removeItem(AUTH_CONFIG.EXPIRES_AT_KEY);
  }

  private handleError(error: AxiosError<ApiError>): Error {
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      return new Error(apiError.message || 'An error occurred');
    }

    if (error.message === 'Network Error') {
      return new Error('Network error. Please check your connection.');
    }

    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. Please try again.');
    }

    return new Error(error.message || 'An unexpected error occurred');
  }

  public async get<T>(url: string, params?: unknown): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  public async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  public async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  public setAuthToken(token: string, refreshToken: string, expiresIn: number) {
    if (typeof window === 'undefined') return;
    
    // Validate tokens before saving
    if (!token || token === 'undefined' || !refreshToken || refreshToken === 'undefined') {
      console.error('[HTTP] Invalid tokens provided to setAuthToken');
      return;
    }
    
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(
      AUTH_CONFIG.EXPIRES_AT_KEY,
      String(Date.now() + expiresIn * 1000)
    );
  }

  public clearAuthToken() {
    this.clearAuth();
  }
}

export const httpClient = new HttpClient();
