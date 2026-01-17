import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/services/report.service';

interface ReportParams {
  startDate: string;
  endDate: string;
}

export const useSalesPipelineReport = (params: ReportParams) => {
  return useQuery({
    queryKey: ['reports', 'sales-pipeline', params],
    queryFn: () => reportApi.salesPipeline(params),
    enabled: !!params.startDate && !!params.endDate,
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

export const useUserActivityReport = (params: ReportParams) => {
  return useQuery({
    queryKey: ['reports', 'user-activity', params],
    queryFn: () => reportApi.userActivity(params),
    enabled: !!params.startDate && !!params.endDate,
  });
};
