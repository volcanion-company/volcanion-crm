import { httpClient } from '@/lib/http-client';
import type {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

const BASE_URL = '/contacts';

export const contactService = {
  // Get all contacts with pagination
  async getContacts(params?: PaginationParams & { customerId?: string }): Promise<PaginatedResponse<Contact>> {
    return await httpClient.get<PaginatedResponse<Contact>>(BASE_URL, { params });
  },

  // Get single contact by ID
  async getContact(id: string): Promise<Contact> {
    return await httpClient.get<Contact>(`${BASE_URL}/${id}`);
  },

  // Create new contact
  async createContact(data: CreateContactRequest): Promise<Contact> {
    return await httpClient.post<Contact>(BASE_URL, data);
  },

  // Update existing contact
  async updateContact(id: string, data: UpdateContactRequest): Promise<Contact> {
    return await httpClient.put<Contact>(`${BASE_URL}/${id}`, data);
  },

  // Delete contact
  async deleteContact(id: string): Promise<void> {
    await httpClient.delete(`${BASE_URL}/${id}`);
  },

  // Search contacts
  async searchContacts(searchTerm: string, params?: PaginationParams): Promise<PaginatedResponse<Contact>> {
    return await httpClient.get<PaginatedResponse<Contact>>(`${BASE_URL}/search`, {
      params: { ...params, q: searchTerm },
    });
  },
};

