import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dealApi } from '@/services/deal.service';
import {
  CreateDealRequest,
  UpdateDealRequest,
  LoseDealRequest,
  PaginationParams,
} from '@/types';

export const useDeals = (params?: PaginationParams & { stage?: string }) => {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: () => dealApi.list(params),
  });
};

export const useDeal = (id: string) => {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: () => dealApi.get(id),
    enabled: !!id,
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDealRequest) => dealApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};

export const useUpdateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDealRequest }) =>
      dealApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', variables.id] });
    },
  });
};

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dealApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};

export const useMoveDealToNextStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dealApi.moveToNextStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};

export const useWinDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dealApi.win(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};

export const useLoseDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LoseDealRequest }) =>
      dealApi.lose(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};
