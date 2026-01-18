import { httpClient } from '@/lib/http-client';
import {
  Workflow,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

// Backend API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const workflowApi = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Workflow>> => {
    const response = await httpClient.get<ApiResponse<PaginatedResponse<Workflow>>>('/api/v1/workflows', params);
    return response.data;
  },

  get: async (id: string): Promise<Workflow> => {
    const response = await httpClient.get<ApiResponse<Workflow>>(`/api/v1/workflows/${id}`);
    return response.data;
  },

  create: async (data: CreateWorkflowRequest): Promise<Workflow> => {
    const response = await httpClient.post<ApiResponse<Workflow>>('/api/v1/workflows', data);
    return response.data;
  },

  update: async (id: string, data: UpdateWorkflowRequest): Promise<Workflow> => {
    const response = await httpClient.put<ApiResponse<Workflow>>(`/api/v1/workflows/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete<ApiResponse<void>>(`/api/v1/workflows/${id}`);
  },

  activate: async (id: string): Promise<Workflow> => {
    const response = await httpClient.post<ApiResponse<Workflow>>(`/api/v1/workflows/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: string): Promise<Workflow> => {
    const response = await httpClient.post<ApiResponse<Workflow>>(`/api/v1/workflows/${id}/deactivate`);
    return response.data;
  },
};
