import { httpClient } from '@/lib/http-client';
import {
  Webhook,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookDelivery,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

// Backend API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const webhookApi = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Webhook>> => {
    const response = await httpClient.get<ApiResponse<PaginatedResponse<Webhook>>>('/api/v1/webhooks', params);
    return response.data;
  },

  get: async (id: string): Promise<Webhook> => {
    const response = await httpClient.get<ApiResponse<Webhook>>(`/api/v1/webhooks/${id}`);
    return response.data;
  },

  create: async (data: CreateWebhookRequest): Promise<Webhook> => {
    const response = await httpClient.post<ApiResponse<Webhook>>('/api/v1/webhooks', data);
    return response.data;
  },

  update: async (id: string, data: UpdateWebhookRequest): Promise<Webhook> => {
    const response = await httpClient.put<ApiResponse<Webhook>>(`/api/v1/webhooks/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete<ApiResponse<void>>(`/api/v1/webhooks/${id}`);
  },

  getDeliveries: async (id: string, params?: PaginationParams): Promise<PaginatedResponse<WebhookDelivery>> => {
    const response = await httpClient.get<ApiResponse<PaginatedResponse<WebhookDelivery>>>(`/api/v1/webhooks/${id}/deliveries`, params);
    return response.data;
  },
};
