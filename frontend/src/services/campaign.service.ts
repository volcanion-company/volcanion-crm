import { httpClient } from '@/lib/http-client';
import {
  Campaign,
  CreateCampaignRequest,
  Segment,
  CreateSegmentRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const campaignApi = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Campaign>> => {
    return httpClient.get<PaginatedResponse<Campaign>>('/api/v1/campaigns', params);
  },

  create: async (data: CreateCampaignRequest): Promise<Campaign> => {
    return httpClient.post<Campaign>('/api/v1/campaigns', data);
  },

  send: async (id: string): Promise<void> => {
    return httpClient.post<void>(`/api/v1/campaigns/${id}/send`);
  },
};

export const segmentApi = {
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Segment>> => {
    return httpClient.get<PaginatedResponse<Segment>>('/api/v1/segments', params);
  },

  create: async (data: CreateSegmentRequest): Promise<Segment> => {
    return httpClient.post<Segment>('/api/v1/segments', data);
  },
};
