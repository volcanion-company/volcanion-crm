import { httpClient } from '@/lib/http-client';
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  RecordPaymentRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

const BASE_URL = '/orders';

export const orderService = {
  // Get all orders with pagination
  async getOrders(params?: PaginationParams): Promise<PaginatedResponse<Order>> {
    return await httpClient.get<PaginatedResponse<Order>>(BASE_URL, { params });
  },

  // Get single order by ID
  async getOrder(id: string): Promise<Order> {
    return await httpClient.get<Order>(`${BASE_URL}/${id}`);
  },

  // Create new order
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    return await httpClient.post<Order>(BASE_URL, data);
  },

  // Update existing order
  async updateOrder(id: string, data: UpdateOrderRequest): Promise<Order> {
    return await httpClient.put<Order>(`${BASE_URL}/${id}`, data);
  },

  // Delete order
  async deleteOrder(id: string): Promise<void> {
    await httpClient.delete(`${BASE_URL}/${id}`);
  },

  // Confirm order
  async confirmOrder(id: string): Promise<Order> {
    return await httpClient.post<Order>(`${BASE_URL}/${id}/confirm`);
  },

  // Cancel order
  async cancelOrder(id: string, reason?: string): Promise<Order> {
    return await httpClient.post<Order>(`${BASE_URL}/${id}/cancel`, { reason });
  },

  // Record payment
  async recordPayment(id: string, data: RecordPaymentRequest): Promise<Order> {
    return await httpClient.post<Order>(`${BASE_URL}/${id}/payments`, data);
  },

  // Get orders by customer
  async getOrdersByCustomer(customerId: string, params?: PaginationParams): Promise<PaginatedResponse<Order>> {
    return await httpClient.get<PaginatedResponse<Order>>(`${BASE_URL}/customer/${customerId}`, { params });
  },

  // Get order statistics
  async getOrderStats(): Promise<{
    total: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    byStatus: {
      status: number;
      count: number;
      totalAmount: number;
    }[];
  }> {
    return await httpClient.get(`${BASE_URL}/stats`);
  },
};
