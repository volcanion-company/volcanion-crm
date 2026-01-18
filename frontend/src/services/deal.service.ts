import { httpClient } from '@/lib/http-client';
import {
  Deal,
  CreateDealRequest,
  UpdateDealRequest,
  LoseDealRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

// Backend API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const dealApi = {
  list: async (params?: PaginationParams & { stage?: string }): Promise<PaginatedResponse<Deal>> => {
    const response = await httpClient.get<ApiResponse<PaginatedResponse<Deal>>>('/api/v1/opportunities', params);
    return response.data;
  },

  get: async (id: string): Promise<Deal> => {
    const response = await httpClient.get<ApiResponse<Deal>>(`/api/v1/opportunities/${id}`);
    return response.data;
  },

  create: async (data: CreateDealRequest): Promise<Deal> => {
    const response = await httpClient.post<ApiResponse<Deal>>('/api/v1/opportunities', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDealRequest): Promise<Deal> => {
    const response = await httpClient.put<ApiResponse<Deal>>(`/api/v1/opportunities/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete<ApiResponse<void>>(`/api/v1/opportunities/${id}`);
  },

  moveToNextStage: async (id: string): Promise<Deal> => {
    const response = await httpClient.put<ApiResponse<Deal>>(`/api/v1/opportunities/${id}/stage`);
    return response.data;
  },

  win: async (id: string): Promise<Deal> => {
    const response = await httpClient.post<ApiResponse<Deal>>(`/api/v1/opportunities/${id}/win`);
    return response.data;
  },

  lose: async (id: string, data: LoseDealRequest): Promise<Deal> => {
    const response = await httpClient.post<ApiResponse<Deal>>(`/api/v1/opportunities/${id}/lose`, data);
    return response.data;
  },
};
