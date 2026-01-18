import { httpClient } from '@/lib/http-client';
import {
  Lead,
  CreateLeadRequest,
  UpdateLeadRequest,
  AssignLeadRequest,
  ConvertLeadRequest,
  ConvertLeadResponse,
  PaginatedResponse,
  PaginationParams,
  LeadStatus,
  LeadRating,
  LeadSource,
} from '@/types';

// Backend API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Backend uses different field names for pagination
interface BackendPaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface LeadListParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
  search?: string;
  status?: LeadStatus;
  rating?: LeadRating;
  source?: LeadSource;
  assignedTo?: string;
}

export const leadApi = {
  list: async (params?: PaginationParams & { status?: LeadStatus; rating?: LeadRating; source?: LeadSource; search?: string; assignedTo?: string; pageNumber?: number }): Promise<PaginatedResponse<Lead>> => {
    // Convert frontend params to backend params
    const backendParams: LeadListParams = {
      pageNumber: params?.pageNumber || params?.page || 1,
      pageSize: params?.pageSize || 10,
      search: params?.search,
      status: params?.status,
      rating: params?.rating,
      source: params?.source,
      assignedTo: params?.assignedTo,
    };

    const response = await httpClient.get<ApiResponse<BackendPaginatedResponse<Lead>>>('/api/v1/leads', backendParams);
    
    // Convert backend response to frontend format
    return {
      items: response.data.items,
      page: response.data.pageNumber,
      pageSize: response.data.pageSize,
      totalPages: response.data.totalPages,
      totalCount: response.data.totalCount,
      hasPreviousPage: response.data.hasPreviousPage,
      hasNextPage: response.data.hasNextPage,
    };
  },

  get: async (id: string): Promise<Lead> => {
    const response = await httpClient.get<ApiResponse<Lead>>(`/api/v1/leads/${id}`);
    return response.data;
  },

  create: async (data: CreateLeadRequest): Promise<Lead> => {
    const response = await httpClient.post<ApiResponse<Lead>>('/api/v1/leads', data);
    return response.data;
  },

  update: async (id: string, data: UpdateLeadRequest): Promise<Lead> => {
    const response = await httpClient.put<ApiResponse<Lead>>(`/api/v1/leads/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete<ApiResponse<void>>(`/api/v1/leads/${id}`);
  },

  assign: async (id: string, data: AssignLeadRequest): Promise<void> => {
    await httpClient.post<ApiResponse<void>>(`/api/v1/leads/${id}/assign`, data);
  },

  convert: async (id: string, data: ConvertLeadRequest): Promise<ConvertLeadResponse> => {
    const response = await httpClient.post<ApiResponse<ConvertLeadResponse>>(`/api/v1/leads/${id}/convert`, data);
    return response.data;
  },
};
