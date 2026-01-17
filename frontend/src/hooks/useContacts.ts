import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactApi } from '@/services/contact.service';
import {
  CreateContactRequest,
  UpdateContactRequest,
  PaginationParams,
} from '@/types';

export const useContacts = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => contactApi.list(params),
  });
};

export const useContact = (id: string) => {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactApi.get(id),
    enabled: !!id,
  });
};

export const useContactTimeline = (id: string) => {
  return useQuery({
    queryKey: ['contacts', id, 'timeline'],
    queryFn: () => contactApi.getTimeline(id),
    enabled: !!id,
  });
};

export const useContactHealthScore = (id: string) => {
  return useQuery({
    queryKey: ['contacts', id, 'health-score'],
    queryFn: () => contactApi.getHealthScore(id),
    enabled: !!id,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactRequest) => contactApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactRequest }) =>
      contactApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', variables.id] });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};
