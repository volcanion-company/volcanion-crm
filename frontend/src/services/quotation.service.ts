import { httpClient } from '@/lib/http-client';
import type {
  Quotation,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  Order,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

const BASE_URL = '/quotations';

export const quotationService = {
  // Get all quotations
  async getQuotations(params?: PaginationParams): Promise<PaginatedResponse<Quotation>> {
    return httpClient.get(BASE_URL, { params });
  },

  // Get single quotation
  async getQuotation(id: string): Promise<Quotation> {
    return httpClient.get(`${BASE_URL}/${id}`);
  },

  // Create quotation
  async createQuotation(data: CreateQuotationRequest): Promise<Quotation> {
    return httpClient.post(BASE_URL, data);
  },

  // Update quotation
  async updateQuotation(id: string, data: UpdateQuotationRequest): Promise<Quotation> {
    return httpClient.put(`${BASE_URL}/${id}`, data);
  },

  // Delete quotation
  async deleteQuotation(id: string): Promise<void> {
    return httpClient.delete(`${BASE_URL}/${id}`);
  },

  // Send quotation
  async sendQuotation(id: string): Promise<Quotation> {
    return httpClient.post(`${BASE_URL}/${id}/send`);
  },

  // Accept quotation
  async acceptQuotation(id: string): Promise<Quotation> {
    return httpClient.post(`${BASE_URL}/${id}/accept`);
  },

  // Reject quotation
  async rejectQuotation(id: string, reason?: string): Promise<Quotation> {
    return httpClient.post(`${BASE_URL}/${id}/reject`, { reason });
  },

  // Convert to order
  async convertToOrder(id: string): Promise<Order> {
    return httpClient.post(`${BASE_URL}/${id}/convert-to-order`);
  },

  // Get quotations by customer
  async getQuotationsByCustomer(
    customerId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Quotation>> {
    return httpClient.get(`${BASE_URL}/by-customer/${customerId}`, { params });
  },

  // Get quotations by opportunity
  async getQuotationsByOpportunity(
    opportunityId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Quotation>> {
    return httpClient.get(`${BASE_URL}/by-opportunity/${opportunityId}`, { params });
  },

  // Get quotation stats
  async getQuotationStats(): Promise<{
    totalQuotations: number;
    pending: number;
    accepted: number;
    rejected: number;
    expired: number;
    totalValue: number;
    conversionRate: number;
  }> {
    return httpClient.get(`${BASE_URL}/stats`);
  },
};
