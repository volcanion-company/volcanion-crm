import { httpClient } from '@/lib/http-client';
import {
  Workflow,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const workflowApi = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Workflow>> => {
    return httpClient.get<PaginatedResponse<Workflow>>('/api/v1/workflows', params);
  },

  get: async (id: string): Promise<Workflow> => {
    return httpClient.get<Workflow>(`/api/v1/workflows/${id}`);
  },

  create: async (data: CreateWorkflowRequest): Promise<Workflow> => {
    return httpClient.post<Workflow>('/api/v1/workflows', data);
  },

  update: async (id: string, data: UpdateWorkflowRequest): Promise<Workflow> => {
    return httpClient.put<Workflow>(`/api/v1/workflows/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return httpClient.delete<void>(`/api/v1/workflows/${id}`);
  },

  activate: async (id: string): Promise<Workflow> => {
    return httpClient.post<Workflow>(`/api/v1/workflows/${id}/activate`);
  },

  deactivate: async (id: string): Promise<Workflow> => {
    return httpClient.post<Workflow>(`/api/v1/workflows/${id}/deactivate`);
  },
};
