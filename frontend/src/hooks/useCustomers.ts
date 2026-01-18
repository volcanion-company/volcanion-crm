import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/customer.service';
import { toast } from '@/lib/toast';
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  PaginationParams,
  CustomerType,
  CustomerStatus,
} from '@/types';

const CUSTOMERS_QUERY_KEY = 'customers';

// Get all customers with filters
export function useCustomers(
  params?: PaginationParams & {
    pageNumber?: number;
    type?: CustomerType;
    status?: CustomerStatus;
    search?: string;
  }
) {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, params],
    queryFn: () => customerService.getCustomers(params),
  });
}

// Get single customer
export function useCustomer(id: string) {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, id],
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
  });
}

// Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      toast.success('Tạo khách hàng thành công', 'Khách hàng đã được tạo và lưu.');
    },
    onError: (error: Error) => {
      toast.error('Không thể tạo khách hàng', error.message || 'Đã xảy ra lỗi khi tạo khách hàng.');
    },
  });
}

// Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      customerService.updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY, variables.id] });
      toast.success('Cập nhật khách hàng thành công', 'Các thay đổi đã được lưu.');
    },
    onError: (error: Error) => {
      toast.error('Không thể cập nhật khách hàng', error.message || 'Đã xảy ra lỗi khi cập nhật khách hàng.');
    },
  });
}

// Delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      toast.success('Xóa khách hàng thành công', 'Khách hàng đã được xóa vĩnh viễn.');
    },
    onError: (error: Error) => {
      toast.error('Không thể xóa khách hàng', error.message || 'Đã xảy ra lỗi khi xóa khách hàng.');
    },
  });
}
