import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadApi } from '@/services/lead.service';
import {

  CreateLeadRequest,
  UpdateLeadRequest,
  ConvertLeadRequest,
  PaginationParams,
} from '@/types';

export const useLeads = (params?: PaginationParams & { status?: string; source?: string }) => {
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
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
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
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};
