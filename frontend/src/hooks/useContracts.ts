import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractService } from '@/services/contract.service';
import type {
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
  PaginationParams,
} from '@/types';
import { toast } from 'sonner';

const CONTRACTS_QUERY_KEY = 'contracts';

// Get all contracts
export function useContracts(params?: PaginationParams) {
  return useQuery({
    queryKey: [CONTRACTS_QUERY_KEY, params],
    queryFn: () => contractService.getContracts(params),
  });
}

// Get single contract
export function useContract(id: string) {
  return useQuery({
    queryKey: [CONTRACTS_QUERY_KEY, id],
    queryFn: () => contractService.getContract(id),
    enabled: !!id,
  });
}

// Get contract stats
export function useContractStats() {
  return useQuery({
    queryKey: [CONTRACTS_QUERY_KEY, 'stats'],
    queryFn: () => contractService.getContractStats(),
  });
}

// Get expiring contracts
export function useExpiringSoonContracts(days: number = 30, params?: PaginationParams) {
  return useQuery({
    queryKey: [CONTRACTS_QUERY_KEY, 'expiring', days, params],
    queryFn: () => contractService.getExpiringSoon(days, params),
  });
}

// Get contracts by customer
export function useContractsByCustomer(customerId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: [CONTRACTS_QUERY_KEY, 'customer', customerId, params],
    queryFn: () => contractService.getContractsByCustomer(customerId, params),
    enabled: !!customerId,
  });
}

// Create contract
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContractRequest) => contractService.createContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      toast.success('Contract created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create contract');
    },
  });
}

// Update contract
export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContractRequest }) =>
      contractService.updateContract(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      toast.success('Contract updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update contract');
    },
  });
}

// Delete contract
export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractService.deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      toast.success('Contract deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete contract');
    },
  });
}

// Approve contract
export function useApproveContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractService.approveContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      toast.success('Contract approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve contract');
    },
  });
}

// Activate contract
export function useActivateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractService.activateContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      toast.success('Contract activated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate contract');
    },
  });
}

// Renew contract
export function useRenewContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractService.renewContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      toast.success('Contract renewed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to renew contract');
    },
  });
}

// Cancel contract
export function useCancelContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      contractService.cancelContract(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      toast.success('Contract cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel contract');
    },
  });
}
