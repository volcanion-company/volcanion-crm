import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationService } from '@/services/quotation.service';
import type {
  Quotation,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  PaginationParams,
} from '@/types';
import { toast } from 'sonner';

const QUOTATIONS_QUERY_KEY = 'quotations';

// Get all quotations
export function useQuotations(params?: PaginationParams) {
  return useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY, params],
    queryFn: () => quotationService.getQuotations(params),
  });
}

// Get single quotation
export function useQuotation(id: string) {
  return useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY, id],
    queryFn: () => quotationService.getQuotation(id),
    enabled: !!id,
  });
}

// Get quotation stats
export function useQuotationStats() {
  return useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY, 'stats'],
    queryFn: () => quotationService.getQuotationStats(),
  });
}

// Get quotations by customer
export function useQuotationsByCustomer(customerId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY, 'customer', customerId, params],
    queryFn: () => quotationService.getQuotationsByCustomer(customerId, params),
    enabled: !!customerId,
  });
}

// Get quotations by opportunity
export function useQuotationsByOpportunity(opportunityId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY, 'opportunity', opportunityId, params],
    queryFn: () => quotationService.getQuotationsByOpportunity(opportunityId, params),
    enabled: !!opportunityId,
  });
}

// Create quotation
export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuotationRequest) => quotationService.createQuotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      toast.success('Quotation created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create quotation');
    },
  });
}

// Update quotation
export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuotationRequest }) =>
      quotationService.updateQuotation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      toast.success('Quotation updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update quotation');
    },
  });
}

// Delete quotation
export function useDeleteQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationService.deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      toast.success('Quotation deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete quotation');
    },
  });
}

// Send quotation
export function useSendQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationService.sendQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      toast.success('Quotation sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send quotation');
    },
  });
}

// Accept quotation
export function useAcceptQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationService.acceptQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      toast.success('Quotation accepted! 🎉');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept quotation');
    },
  });
}

// Reject quotation
export function useRejectQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      quotationService.rejectQuotation(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      toast.success('Quotation rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject quotation');
    },
  });
}

// Convert to order
export function useConvertToOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationService.convertToOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Quotation converted to order successfully! 🎉');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to convert quotation');
    },
  });
}
