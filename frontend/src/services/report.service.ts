import { httpClient } from '@/lib/http-client';
import {
  SalesPipelineReport,
  LeadConversionReport,
  TicketAnalyticsReport,
  UserActivityReport,
} from '@/types';

interface ReportParams {
  startDate: string;
  endDate: string;
}

export const reportApi = {
  salesPipeline: async (params: ReportParams): Promise<SalesPipelineReport> => {
    return httpClient.get<SalesPipelineReport>('/api/v1/reports/sales-pipeline', params);
  },

  leadConversion: async (params: ReportParams): Promise<LeadConversionReport> => {
    return httpClient.get<LeadConversionReport>('/api/v1/reports/lead-conversion', params);
  },

  ticketAnalytics: async (params: ReportParams): Promise<TicketAnalyticsReport> => {
    return httpClient.get<TicketAnalyticsReport>('/api/v1/reports/ticket-analytics', params);
  },

  userActivity: async (params: ReportParams): Promise<UserActivityReport[]> => {
    return httpClient.get<UserActivityReport[]>('/api/v1/reports/user-activity', params);
  },
};
