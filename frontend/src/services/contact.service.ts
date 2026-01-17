import { httpClient } from '@/lib/http-client';
import {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  ContactTimeline,
  ContactHealthScore,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const contactApi = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Contact>> => {
    return httpClient.get<PaginatedResponse<Contact>>('/api/v1/contacts', params);
  },

  get: async (id: string): Promise<Contact> => {
    return httpClient.get<Contact>(`/api/v1/contacts/${id}`);
  },

  create: async (data: CreateContactRequest): Promise<Contact> => {
    return httpClient.post<Contact>('/api/v1/contacts', data);
  },

  update: async (id: string, data: UpdateContactRequest): Promise<Contact> => {
    return httpClient.put<Contact>(`/api/v1/contacts/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return httpClient.delete<void>(`/api/v1/contacts/${id}`);
  },

  getTimeline: async (id: string): Promise<ContactTimeline[]> => {
    return httpClient.get<ContactTimeline[]>(`/api/v1/contacts/${id}/timeline`);
  },

  getHealthScore: async (id: string): Promise<ContactHealthScore> => {
    return httpClient.get<ContactHealthScore>(`/api/v1/contacts/${id}/health-score`);
  },
};
