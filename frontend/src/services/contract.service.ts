import { httpClient } from '@/lib/http-client';
import type {
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

const BASE_URL = '/contracts';

export const contractService = {
  // Get all contracts
  async getContracts(params?: PaginationParams): Promise<PaginatedResponse<Contract>> {
    return httpClient.get(BASE_URL, { params });
  },

  // Get single contract
  async getContract(id: string): Promise<Contract> {
    return httpClient.get(`${BASE_URL}/${id}`);
  },

  // Create contract
  async createContract(data: CreateContractRequest): Promise<Contract> {
    return httpClient.post(BASE_URL, data);
  },

  // Update contract
  async updateContract(id: string, data: UpdateContractRequest): Promise<Contract> {
    return httpClient.put(`${BASE_URL}/${id}`, data);
  },

  // Delete contract
  async deleteContract(id: string): Promise<void> {
    return httpClient.delete(`${BASE_URL}/${id}`);
  },

  // Approve contract
  async approveContract(id: string): Promise<Contract> {
    return httpClient.post(`${BASE_URL}/${id}/approve`);
  },

  // Activate contract
  async activateContract(id: string): Promise<Contract> {
    return httpClient.post(`${BASE_URL}/${id}/activate`);
  },

  // Renew contract
  async renewContract(id: string): Promise<Contract> {
    return httpClient.post(`${BASE_URL}/${id}/renew`);
  },

  // Cancel contract
  async cancelContract(id: string, reason?: string): Promise<Contract> {
    return httpClient.post(`${BASE_URL}/${id}/cancel`, { reason });
  },

  // Get expiring contracts
  async getExpiringSoon(days: number = 30, params?: PaginationParams): Promise<PaginatedResponse<Contract>> {
    return httpClient.get(`${BASE_URL}/expiring-soon`, {
      params: { ...params, days },
    });
  },

  // Get contracts by customer
  async getContractsByCustomer(
    customerId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Contract>> {
    return httpClient.get(`${BASE_URL}/by-customer/${customerId}`, { params });
  },

  // Get contract stats
  async getContractStats(): Promise<{
    totalContracts: number;
    activeContracts: number;
    expiringSoon: number;
    totalValue: number;
    recurringRevenue: number;
  }> {
    return httpClient.get(`${BASE_URL}/stats`);
  },
};
