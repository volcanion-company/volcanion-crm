import { httpClient } from '@/lib/http-client';
import type {
  Opportunity,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

const BASE_URL = '/opportunities';

export const opportunityService = {
  // Get all opportunities with pagination
  async getOpportunities(params?: PaginationParams): Promise<PaginatedResponse<Opportunity>> {
    return await httpClient.get<PaginatedResponse<Opportunity>>(BASE_URL, { params });
  },

  // Get single opportunity by ID
  async getOpportunity(id: string): Promise<Opportunity> {
    return await httpClient.get<Opportunity>(`${BASE_URL}/${id}`);
  },

  // Create new opportunity
  async createOpportunity(data: CreateOpportunityRequest): Promise<Opportunity> {
    return await httpClient.post<Opportunity>(BASE_URL, data);
  },

  // Update existing opportunity
  async updateOpportunity(id: string, data: UpdateOpportunityRequest): Promise<Opportunity> {
    return await httpClient.put<Opportunity>(`${BASE_URL}/${id}`, data);
  },

  // Delete opportunity
  async deleteOpportunity(id: string): Promise<void> {
    await httpClient.delete(`${BASE_URL}/${id}`);
  },

  // Move opportunity to next stage
  async moveToNextStage(id: string): Promise<Opportunity> {
    return await httpClient.post<Opportunity>(`${BASE_URL}/${id}/move-next`);
  },

  // Move opportunity to previous stage
  async moveToPreviousStage(id: string): Promise<Opportunity> {
    return await httpClient.post<Opportunity>(`${BASE_URL}/${id}/move-previous`);
  },

  // Mark opportunity as won
  async markAsWon(id: string): Promise<Opportunity> {
    return await httpClient.post<Opportunity>(`${BASE_URL}/${id}/win`);
  },

  // Mark opportunity as lost
  async markAsLost(id: string, lossReason?: string): Promise<Opportunity> {
    return await httpClient.post<Opportunity>(`${BASE_URL}/${id}/lose`, { lossReason });
  },

  // Get pipeline statistics
  async getPipelineStats(): Promise<{
    total: number;
    totalAmount: number;
    weightedAmount: number;
    wonCount: number;
    wonAmount: number;
    lostCount: number;
    lostAmount: number;
    winRate: number;
    byStage: {
      stage: number;
      count: number;
      totalAmount: number;
      weightedAmount: number;
    }[];
  }> {
    return await httpClient.get(`${BASE_URL}/pipeline/stats`);
  },

  // Get opportunities by customer
  async getOpportunitiesByCustomer(customerId: string, params?: PaginationParams): Promise<PaginatedResponse<Opportunity>> {
    return await httpClient.get<PaginatedResponse<Opportunity>>(`${BASE_URL}/customer/${customerId}`, { params });
  },
};
