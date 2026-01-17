import { httpClient } from '@/lib/http-client';
import {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const activityApi = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Activity>> => {
    return httpClient.get<PaginatedResponse<Activity>>('/api/v1/activities', params);
  },

  get: async (id: string): Promise<Activity> => {
    return httpClient.get<Activity>(`/api/v1/activities/${id}`);
  },

  create: async (data: CreateActivityRequest): Promise<Activity> => {
    return httpClient.post<Activity>('/api/v1/activities', data);
  },

  update: async (id: string, data: UpdateActivityRequest): Promise<Activity> => {
    return httpClient.put<Activity>(`/api/v1/activities/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return httpClient.delete<void>(`/api/v1/activities/${id}`);
  },

  complete: async (id: string): Promise<Activity> => {
    return httpClient.post<Activity>(`/api/v1/activities/${id}/complete`);
  },
};
