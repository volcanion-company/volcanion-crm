import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadApi } from '@/services/lead.service';
import { toast } from '@/lib/toast';
import {
  CreateLeadRequest,
  UpdateLeadRequest,
  AssignLeadRequest,
  ConvertLeadRequest,
  PaginationParams,
  LeadStatus,
  LeadRating,
  LeadSource,
} from '@/types';

export const useLeads = (params?: PaginationParams & { status?: LeadStatus; rating?: LeadRating; source?: LeadSource; search?: string; assignedTo?: string }) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadApi.list(params),
  });
};

export const useLead = (id: string) => {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => leadApi.get(id),
    enabled: !!id,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadRequest) => leadApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Tạo Lead thành công', 'Lead của bạn đã được tạo và lưu.');
    },
    onError: (error: Error) => {
      toast.error('Không thể tạo Lead', error.message || 'Đã xảy ra lỗi khi tạo Lead.');
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadRequest }) =>
      leadApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
      toast.success('Cập nhật Lead thành công', 'Các thay đổi của bạn đã được lưu.');
    },
    onError: (error: Error) => {
      toast.error('Không thể cập nhật Lead', error.message || 'Đã xảy ra lỗi khi cập nhật Lead.');
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Xóa Lead thành công', 'Lead đã được xóa vĩnh viễn.');
    },
    onError: (error: Error) => {
      toast.error('Không thể xóa Lead', error.message || 'Đã xảy ra lỗi khi xóa Lead.');
    },
  });
};

export const useAssignLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignLeadRequest }) =>
      leadApi.assign(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
      toast.success('Phân công Lead thành công', 'Lead đã được giao cho người dùng khác.');
    },
    onError: (error: Error) => {
      toast.error('Không thể phân công Lead', error.message || 'Đã xảy ra lỗi khi phân công Lead.');
    },
  });
};

export const useConvertLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConvertLeadRequest }) =>
      leadApi.convert(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Chuyển đổi Lead thành công', 'Lead đã được chuyển thành khách hàng.');
    },
    onError: (error: Error) => {
      toast.error('Không thể chuyển đổi Lead', error.message || 'Đã xảy ra lỗi khi chuyển đổi Lead.');
    },
  });
};
