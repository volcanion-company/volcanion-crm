import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/services/report.service';

interface ReportParams {
  startDate: string;
  endDate: string;
}

interface PipelineAnalysisParams {
  pipelineId: string;
}

export const useDashboardReport = () => {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: () => reportApi.dashboard(),
  });
};

export const useSalesPerformanceReport = (params: ReportParams) => {
  return useQuery({
    queryKey: ['reports', 'sales-performance', params],
    queryFn: () => reportApi.salesPerformance(params),
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const usePipelineAnalysisReport = (params: PipelineAnalysisParams) => {
  return useQuery({
    queryKey: ['reports', 'pipeline-analysis', params],
    queryFn: () => reportApi.pipelineAnalysis(params),
    enabled: !!params.pipelineId,
  });
};

export const useLeadConversionReport = (params: ReportParams) => {
  return useQuery({
    queryKey: ['reports', 'lead-conversion', params],
    queryFn: () => reportApi.leadConversion(params),
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useTicketAnalyticsReport = (params: ReportParams) => {
  return useQuery({
    queryKey: ['reports', 'ticket-analytics', params],
    queryFn: () => reportApi.ticketAnalytics(params),
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useActivitySummaryReport = (params: ReportParams) => {
  return useQuery({
    queryKey: ['reports', 'activity-summary', params],
    queryFn: () => reportApi.activitySummary(params),
    enabled: !!params.startDate && !!params.endDate,
  });
};
