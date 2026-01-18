import { httpClient } from '@/lib/http-client';
import {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

// Backend API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const activityApi = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Activity>> => {
    const response = await httpClient.get<ApiResponse<PaginatedResponse<Activity>>>('/api/v1/activities', params);
    return response.data;
  },

  get: async (id: string): Promise<Activity> => {
    const response = await httpClient.get<ApiResponse<Activity>>(`/api/v1/activities/${id}`);
    return response.data;
  },

  create: async (data: CreateActivityRequest): Promise<Activity> => {
    const response = await httpClient.post<ApiResponse<Activity>>('/api/v1/activities', data);
    return response.data;
  },

  update: async (id: string, data: UpdateActivityRequest): Promise<Activity> => {
    const response = await httpClient.put<ApiResponse<Activity>>(`/api/v1/activities/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete<ApiResponse<void>>(`/api/v1/activities/${id}`);
  },

  complete: async (id: string): Promise<Activity> => {
    const response = await httpClient.post<ApiResponse<Activity>>(`/api/v1/activities/${id}/complete`);
    return response.data;
  },
};
