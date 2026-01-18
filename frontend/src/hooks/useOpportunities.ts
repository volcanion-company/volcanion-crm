import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunityService } from '@/services/opportunity.service';
import type {
  Opportunity,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  PaginationParams,
} from '@/types';
import { toast } from 'sonner';

const OPPORTUNITIES_QUERY_KEY = 'opportunities';

// Get all opportunities
export function useOpportunities(params?: PaginationParams) {
  return useQuery({
    queryKey: [OPPORTUNITIES_QUERY_KEY, params],
    queryFn: () => opportunityService.getOpportunities(params),
  });
}

// Get single opportunity
export function useOpportunity(id: string) {
  return useQuery({
    queryKey: [OPPORTUNITIES_QUERY_KEY, id],
    queryFn: () => opportunityService.getOpportunity(id),
    enabled: !!id,
  });
}

// Get pipeline stats
export function usePipelineStats() {
  return useQuery({
    queryKey: [OPPORTUNITIES_QUERY_KEY, 'pipeline', 'stats'],
    queryFn: () => opportunityService.getPipelineStats(),
  });
}

// Get opportunities by customer
export function useOpportunitiesByCustomer(customerId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: [OPPORTUNITIES_QUERY_KEY, 'customer', customerId, params],
    queryFn: () => opportunityService.getOpportunitiesByCustomer(customerId, params),
    enabled: !!customerId,
  });
}

// Create opportunity
export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOpportunityRequest) => opportunityService.createOpportunity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPPORTUNITIES_QUERY_KEY] });
      toast.success('Opportunity created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create opportunity');
    },
  });
}

// Update opportunity
export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOpportunityRequest }) =>
      opportunityService.updateOpportunity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPPORTUNITIES_QUERY_KEY] });
      toast.success('Opportunity updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update opportunity');
    },
  });
}

// Delete opportunity
export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => opportunityService.deleteOpportunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPPORTUNITIES_QUERY_KEY] });
      toast.success('Opportunity deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete opportunity');
    },
  });
}

// Move to next stage
export function useMoveToNextStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => opportunityService.moveToNextStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPPORTUNITIES_QUERY_KEY] });
      toast.success('Moved to next stage');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to move to next stage');
    },
  });
}

// Move to previous stage
export function useMoveToPreviousStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => opportunityService.moveToPreviousStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPPORTUNITIES_QUERY_KEY] });
      toast.success('Moved to previous stage');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to move to previous stage');
    },
  });
}

// Mark as won
export function useMarkAsWon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => opportunityService.markAsWon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPPORTUNITIES_QUERY_KEY] });
      toast.success('Opportunity marked as won! 🎉');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark as won');
    },
  });
}

// Mark as lost
export function useMarkAsLost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, lossReason }: { id: string; lossReason?: string }) =>
      opportunityService.markAsLost(id, lossReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPPORTUNITIES_QUERY_KEY] });
      toast.success('Opportunity marked as lost');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark as lost');
    },
  });
}
