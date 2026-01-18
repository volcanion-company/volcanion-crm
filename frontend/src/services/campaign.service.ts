import { httpClient } from '@/lib/http-client';
import {
  Campaign,
  CampaignStatus,
  CampaignType,
  CreateCampaignRequest,
  UpdateCampaignMetricsRequest,
  CampaignPerformance,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

const BASE_URL = '/api/v1/campaigns';

export const campaignService = {
  // Get campaigns with pagination and filters
  async getCampaigns(params?: PaginationParams & {
    type?: CampaignType;
    status?: CampaignStatus;
  }): Promise<PaginatedResponse<Campaign>> {
    const response = await httpClient.get<{ success: boolean; data: PaginatedResponse<Campaign> }>(BASE_URL, { params });
    return response.data;
  },

  // Get active campaigns (InProgress status)
  async getActiveCampaigns(params?: PaginationParams): Promise<PaginatedResponse<Campaign>> {
    const response = await httpClient.get<{ success: boolean; data: PaginatedResponse<Campaign> }>(`${BASE_URL}/active`, { params });
    return response.data;
  },

  // Get single campaign
  async getCampaign(id: string): Promise<Campaign> {
    const response = await httpClient.get<{ success: boolean; data: Campaign }>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create campaign
  async createCampaign(data: CreateCampaignRequest): Promise<Campaign> {
    const response = await httpClient.post<{ success: boolean; data: Campaign }>(BASE_URL, data);
    return response.data;
  },

  // Update campaign
  async updateCampaign(id: string, data: Partial<CreateCampaignRequest>): Promise<Campaign> {
    const response = await httpClient.put<{ success: boolean; data: Campaign }>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete campaign
  async deleteCampaign(id: string): Promise<void> {
    return await httpClient.delete(`${BASE_URL}/${id}`);
  },

  // Activate campaign (Draft → InProgress)
  async activateCampaign(id: string): Promise<Campaign> {
    const response = await httpClient.post<{ success: boolean; data: Campaign }>(`${BASE_URL}/${id}/activate`);
    return response.data;
  },

  // Pause campaign (InProgress → Paused)
  async pauseCampaign(id: string): Promise<Campaign> {
    const response = await httpClient.post<{ success: boolean; data: Campaign }>(`${BASE_URL}/${id}/pause`);
    return response.data;
  },

  // Complete campaign (InProgress → Completed)
  async completeCampaign(id: string): Promise<Campaign> {
    const response = await httpClient.post<{ success: boolean; data: Campaign }>(`${BASE_URL}/${id}/complete`);
    return response.data;
  },

  // Update campaign metrics
  async updateMetrics(id: string, data: UpdateCampaignMetricsRequest): Promise<Campaign> {
    const response = await httpClient.post<{ success: boolean; data: Campaign }>(`${BASE_URL}/${id}/update-metrics`, data);
    return response.data;
  },

  // Get campaign performance report
  async getCampaignPerformance(id: string): Promise<CampaignPerformance> {
    const response = await httpClient.get<{ success: boolean; data: CampaignPerformance }>(`${BASE_URL}/${id}/performance`);
    return response.data;
  },
};
