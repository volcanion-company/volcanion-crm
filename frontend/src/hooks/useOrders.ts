import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  RecordPaymentRequest,
  PaginationParams,
} from '@/types';
import { toast } from 'sonner';

const ORDERS_QUERY_KEY = 'orders';

// Get all orders
export function useOrders(params?: PaginationParams) {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, params],
    queryFn: () => orderService.getOrders(params),
  });
}

// Get single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, id],
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  });
}

// Get order stats
export function useOrderStats() {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, 'stats'],
    queryFn: () => orderService.getOrderStats(),
  });
}

// Get orders by customer
export function useOrdersByCustomer(customerId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, 'customer', customerId, params],
    queryFn: () => orderService.getOrdersByCustomer(customerId, params),
    enabled: !!customerId,
  });
}

// Create order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => orderService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toast.success('Order created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });
}

// Update order
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderRequest }) =>
      orderService.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toast.success('Order updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order');
    },
  });
}

// Delete order
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toast.success('Order deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete order');
    },
  });
}

// Confirm order
export function useConfirmOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.confirmOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toast.success('Order confirmed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm order');
    },
  });
}

// Cancel order
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      orderService.cancelOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toast.success('Order cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel order');
    },
  });
}

// Record payment
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecordPaymentRequest }) =>
      orderService.recordPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      toast.success('Payment recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });
}
