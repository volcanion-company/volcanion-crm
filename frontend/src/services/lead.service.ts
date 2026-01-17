import { httpClient } from '@/lib/http-client';
import {
  Lead,
  CreateLeadRequest,
  UpdateLeadRequest,
  ConvertLeadRequest,
  ConvertLeadResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const leadApi = {
  list: async (params?: PaginationParams & { status?: string; source?: string }): Promise<PaginatedResponse<Lead>> => {
    return httpClient.get<PaginatedResponse<Lead>>('/api/v1/leads', params);
  },

  get: async (id: string): Promise<Lead> => {
    return httpClient.get<Lead>(`/api/v1/leads/${id}`);
  },

  create: async (data: CreateLeadRequest): Promise<Lead> => {
    return httpClient.post<Lead>('/api/v1/leads', data);
  },

  update: async (id: string, data: UpdateLeadRequest): Promise<Lead> => {
    return httpClient.put<Lead>(`/api/v1/leads/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return httpClient.delete<void>(`/api/v1/leads/${id}`);
  },

  convert: async (id: string, data: ConvertLeadRequest): Promise<ConvertLeadResponse> => {
    return httpClient.post<ConvertLeadResponse>(`/api/v1/leads/${id}/convert`, data);
  },
};
