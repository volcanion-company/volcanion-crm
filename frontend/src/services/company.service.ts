import { httpClient } from '@/lib/http-client';
import {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const companyApi = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Company>> => {
    return httpClient.get<PaginatedResponse<Company>>('/api/v1/customers', params);
  },

  get: async (id: string): Promise<Company> => {
    return httpClient.get<Company>(`/api/v1/customers/${id}`);
  },

  create: async (data: CreateCompanyRequest): Promise<Company> => {
    return httpClient.post<Company>('/api/v1/customers', data);
  },

  update: async (id: string, data: UpdateCompanyRequest): Promise<Company> => {
    return httpClient.put<Company>(`/api/v1/customers/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return httpClient.delete<void>(`/api/v1/customers/${id}`);
  },
};
