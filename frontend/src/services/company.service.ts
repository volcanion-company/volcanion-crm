import { httpClient } from '@/lib/http-client';
import {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

// Backend API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const companyApi = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Company>> => {
    const response = await httpClient.get<ApiResponse<PaginatedResponse<Company>>>('/api/v1/customers', params);
    return response.data;
  },

  get: async (id: string): Promise<Company> => {
    const response = await httpClient.get<ApiResponse<Company>>(`/api/v1/customers/${id}`);
    return response.data;
  },

  create: async (data: CreateCompanyRequest): Promise<Company> => {
    const response = await httpClient.post<ApiResponse<Company>>('/api/v1/customers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCompanyRequest): Promise<Company> => {
    const response = await httpClient.put<ApiResponse<Company>>(`/api/v1/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete<ApiResponse<void>>(`/api/v1/customers/${id}`);
  },
};
