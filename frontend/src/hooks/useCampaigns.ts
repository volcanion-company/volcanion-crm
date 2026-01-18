import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignService } from '@/services/campaign.service';
import { 
  Campaign, 
  CampaignStatus, 
  CampaignType, 
  CreateCampaignRequest, 
  UpdateCampaignMetricsRequest,
  PaginationParams 
} from '@/types';
import { toast } from '@/lib/toast';

const CAMPAIGNS_QUERY_KEY = 'campaigns';

// Get campaigns list
export function useCampaigns(params?: PaginationParams & {
  type?: CampaignType;
  status?: CampaignStatus;
}) {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, params],
    queryFn: () => campaignService.getCampaigns(params),
  });
}

// Get active campaigns
export function useActiveCampaigns(params?: PaginationParams) {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'active', params],
    queryFn: () => campaignService.getActiveCampaigns(params),
  });
}

// Get single campaign
export function useCampaign(id: string) {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, id],
    queryFn: () => campaignService.getCampaign(id),
    enabled: !!id,
  });
}

// Get campaign performance
export function useCampaignPerformance(id: string) {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, id, 'performance'],
    queryFn: () => campaignService.getCampaignPerformance(id),
    enabled: !!id,
  });
}

// Create campaign
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaignRequest) => campaignService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      toast.success('Tạo chiến dịch thành công', 'Chiến dịch của bạn đã được tạo và lưu.');
    },
    onError: (error: Error) => {
      toast.error('Không thể tạo chiến dịch', error.message || 'Đã xảy ra lỗi khi tạo chiến dịch.');
    },
  });
}

// Update campaign
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCampaignRequest> }) =>
      campaignService.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      toast.success('Cập nhật chiến dịch thành công', 'Các thay đổi của bạn đã được lưu.');
    },
    onError: (error: Error) => {
      toast.error('Không thể cập nhật chiến dịch', error.message || 'Đã xảy ra lỗi khi cập nhật chiến dịch.');
    },
  });
}

// Delete campaign
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      toast.success('Xóa chiến dịch thành công', 'Chiến dịch đã được xóa vĩnh viễn.');
    },
    onError: (error: Error) => {
      toast.error('Không thể xóa chiến dịch', error.message || 'Đã xảy ra lỗi khi xóa chiến dịch.');
    },
  });
}

// Activate campaign
export function useActivateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignService.activateCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      toast.success('Kích hoạt chiến dịch thành công', 'Chiến dịch của bạn hiện đang hoạt động.');
    },
    onError: (error: Error) => {
      toast.error('Không thể kích hoạt chiến dịch', error.message || 'Đã xảy ra lỗi khi kích hoạt chiến dịch.');
    },
  });
}

// Pause campaign
export function usePauseCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignService.pauseCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      toast.success('Tạm dừng chiến dịch thành công', 'Chiến dịch của bạn đã được tạm dừng.');
    },
    onError: (error: Error) => {
      toast.error('Không thể tạm dừng chiến dịch', error.message || 'Đã xảy ra lỗi khi tạm dừng chiến dịch.');
    },
  });
}

// Complete campaign
export function useCompleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignService.completeCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      toast.success('Hoàn thành chiến dịch thành công', 'Chiến dịch của bạn đã được đánh dấu là hoàn thành.');
    },
    onError: (error: Error) => {
      toast.error('Không thể hoàn thành chiến dịch', error.message || 'Đã xảy ra lỗi khi hoàn thành chiến dịch.');
    },
  });
}

// Update campaign metrics
export function useUpdateCampaignMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignMetricsRequest }) =>
      campaignService.updateMetrics(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      toast.success('Cập nhật số liệu thành công', 'Số liệu hiệu suất đã được cập nhật.');
    },
    onError: (error: Error) => {
      toast.error('Không thể cập nhật số liệu', error.message || 'Đã xảy ra lỗi khi cập nhật số liệu chiến dịch.');
    },
  });
}
