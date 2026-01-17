import { httpClient } from '@/lib/http-client';
import {
  Webhook,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookDelivery,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const webhookApi = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Webhook>> => {
    return httpClient.get<PaginatedResponse<Webhook>>('/api/v1/webhooks', params);
  },

  get: async (id: string): Promise<Webhook> => {
    return httpClient.get<Webhook>(`/api/v1/webhooks/${id}`);
  },

  create: async (data: CreateWebhookRequest): Promise<Webhook> => {
    return httpClient.post<Webhook>('/api/v1/webhooks', data);
  },

  update: async (id: string, data: UpdateWebhookRequest): Promise<Webhook> => {
    return httpClient.put<Webhook>(`/api/v1/webhooks/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return httpClient.delete<void>(`/api/v1/webhooks/${id}`);
  },

  getDeliveries: async (id: string, params?: PaginationParams): Promise<PaginatedResponse<WebhookDelivery>> => {
    return httpClient.get<PaginatedResponse<WebhookDelivery>>(`/api/v1/webhooks/${id}/deliveries`, params);
  },
};
