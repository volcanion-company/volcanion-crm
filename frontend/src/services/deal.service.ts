import { httpClient } from '@/lib/http-client';
import {
  Deal,
  CreateDealRequest,
  UpdateDealRequest,
  LoseDealRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const dealApi = {
  list: async (params?: PaginationParams & { stage?: string }): Promise<PaginatedResponse<Deal>> => {
    return httpClient.get<PaginatedResponse<Deal>>('/api/v1/opportunities', params);
  },

  get: async (id: string): Promise<Deal> => {
    return httpClient.get<Deal>(`/api/v1/opportunities/${id}`);
  },

  create: async (data: CreateDealRequest): Promise<Deal> => {
    return httpClient.post<Deal>('/api/v1/opportunities', data);
  },

  update: async (id: string, data: UpdateDealRequest): Promise<Deal> => {
    return httpClient.put<Deal>(`/api/v1/opportunities/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return httpClient.delete<void>(`/api/v1/opportunities/${id}`);
  },

  moveToNextStage: async (id: string): Promise<Deal> => {
    return httpClient.put<Deal>(`/api/v1/opportunities/${id}/stage`);
  },

  win: async (id: string): Promise<Deal> => {
    return httpClient.post<Deal>(`/api/v1/opportunities/${id}/win`);
  },

  lose: async (id: string, data: LoseDealRequest): Promise<Deal> => {
    return httpClient.post<Deal>(`/api/v1/opportunities/${id}/lose`, data);
  },
};
