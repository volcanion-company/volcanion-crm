import { httpClient } from '@/lib/http-client';
import {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  CloseTicketRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const ticketApi = {
  list: async (params?: PaginationParams & { status?: string; priority?: string }): Promise<PaginatedResponse<Ticket>> => {
    return httpClient.get<PaginatedResponse<Ticket>>('/api/v1/tickets', params);
  },

  get: async (id: string): Promise<Ticket> => {
    return httpClient.get<Ticket>(`/api/v1/tickets/${id}`);
  },

  create: async (data: CreateTicketRequest): Promise<Ticket> => {
    return httpClient.post<Ticket>('/api/v1/tickets', data);
  },

  update: async (id: string, data: UpdateTicketRequest): Promise<Ticket> => {
    return httpClient.put<Ticket>(`/api/v1/tickets/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return httpClient.delete<void>(`/api/v1/tickets/${id}`);
  },

  close: async (id: string, data: CloseTicketRequest): Promise<Ticket> => {
    return httpClient.post<Ticket>(`/api/v1/tickets/${id}/close`, data);
  },

  escalate: async (id: string): Promise<Ticket> => {
    return httpClient.post<Ticket>(`/api/v1/tickets/${id}/escalate`);
  },
};
