import { httpClient } from '@/lib/http-client';
import {
  SalesPipelineReport,
  LeadConversionReport,
  TicketAnalyticsReport,
  UserActivityReport,
} from '@/types';

// Backend API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface DashboardReport {
  totalLeads: number;
  totalDeals: number;
  totalContacts: number;
  totalRevenue: number;
  recentActivities: unknown[];
}

interface SalesPerformanceReport {
  totalRevenue: number;
  dealsWon: number;
  dealsLost: number;
  averageDealSize: number;
  performanceByUser: unknown[];
}

interface PipelineAnalysisReport {
  stages: Array<{
    stageName: string;
    dealCount: number;
    totalValue: number;
  }>;
  totalValue: number;
  averageDealSize: number;
}

interface ActivitySummaryReport {
  totalActivities: number;
  activitiesByType: Record<string, number>;
  topUsers: unknown[];
}

interface ReportParams {
  startDate: string;
  endDate: string;
}

interface PipelineAnalysisParams {
  pipelineId: string;
}

export const reportApi = {
  // Dashboard tổng quan
  dashboard: async (): Promise<DashboardReport> => {
    const response = await httpClient.get<ApiResponse<DashboardReport>>('/api/v1/reports/dashboard');
    return response.data;
  },

  // Báo cáo hiệu suất bán hàng
  salesPerformance: async (params: ReportParams): Promise<SalesPerformanceReport> => {
    const response = await httpClient.get<ApiResponse<SalesPerformanceReport>>('/api/v1/reports/sales-performance', params);
    return response.data;
  },

  // Phân tích pipeline
  pipelineAnalysis: async (params: PipelineAnalysisParams): Promise<PipelineAnalysisReport> => {
    const response = await httpClient.get<ApiResponse<PipelineAnalysisReport>>('/api/v1/reports/pipeline-analysis', params);
    return response.data;
  },

  // Tỷ lệ chuyển đổi lead
  leadConversion: async (params: ReportParams): Promise<LeadConversionReport> => {
    const response = await httpClient.get<ApiResponse<LeadConversionReport>>('/api/v1/reports/lead-conversion', params);
    return response.data;
  },

  // Phân tích ticket
  ticketAnalytics: async (params: ReportParams): Promise<TicketAnalyticsReport> => {
    const response = await httpClient.get<ApiResponse<TicketAnalyticsReport>>('/api/v1/reports/ticket-analytics', params);
    return response.data;
  },

  // Tóm tắt hoạt động
  activitySummary: async (params: ReportParams): Promise<ActivitySummaryReport> => {
    const response = await httpClient.get<ApiResponse<ActivitySummaryReport>>('/api/v1/reports/activity-summary', params);
    return response.data;
  },
};
