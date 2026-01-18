import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityApi } from '@/services/activity.service';
import type {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
  PaginationParams,
} from '@/types';
import { toast } from 'sonner';

const ACTIVITIES_QUERY_KEY = 'activities';

// Get all activities
export function useActivities(params?: PaginationParams) {
  return useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, params],
    queryFn: () => activityApi.list(params),
  });
}

// Get single activity
export function useActivity(id: string) {
  return useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, id],
    queryFn: () => activityApi.get(id),
    enabled: !!id,
  });
}

// Create activity
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityRequest) => activityApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
      toast.success('Activity created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create activity');
    },
  });
}

// Update activity
export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActivityRequest }) =>
      activityApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
      toast.success('Activity updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update activity');
    },
  });
}

// Delete activity
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activityApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
      toast.success('Activity deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete activity');
    },
  });
}

// Complete activity
export function useCompleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activityApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
      toast.success('Activity marked as completed! ✓');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete activity');
    },
  });
}
