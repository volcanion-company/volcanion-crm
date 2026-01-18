import { httpClient } from '@/lib/http-client';
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  PaginatedResponse,
  PaginationParams,
  CustomerType,
  CustomerStatus,
} from '@/types';

// Backend API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Backend uses different field names for pagination
interface BackendPaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface CustomerListParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
  search?: string;
  type?: CustomerType;
  status?: CustomerStatus;
}

export const customerService = {
  // Get all customers with pagination and filters
  async getCustomers(
    params?: PaginationParams & {
      pageNumber?: number;
      type?: CustomerType;
      status?: CustomerStatus;
      search?: string;
    }
  ): Promise<PaginatedResponse<Customer>> {
    const backendParams: CustomerListParams = {
      pageNumber: params?.pageNumber || params?.page || 1,
      pageSize: params?.pageSize || 10,
      search: params?.search,
      type: params?.type,
      status: params?.status,
    };

    const response = await httpClient.get<ApiResponse<BackendPaginatedResponse<Customer>>>('/api/v1/customers', backendParams);
    
    // Convert backend response to frontend format
    return {
      items: response.data.items,
      page: response.data.pageNumber,
      pageSize: response.data.pageSize,
      totalPages: response.data.totalPages,
      totalCount: response.data.totalCount,
      hasPreviousPage: response.data.hasPreviousPage,
      hasNextPage: response.data.hasNextPage,
    };
  },

  // Get single customer by ID
  async getCustomer(id: string): Promise<Customer> {
    const response = await httpClient.get<ApiResponse<Customer>>(`/api/v1/customers/${id}`);
    return response.data;
  },

  // Create new customer
  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    // Clean up empty string fields that should be null or undefined
    const cleanedData = { ...data };
    
    // Convert empty strings to null for Guid fields
    if (cleanedData.assignedToUserId === '') {
      delete cleanedData.assignedToUserId;
    }
    
    // Remove empty optional fields
    Object.keys(cleanedData).forEach(key => {
      const value = cleanedData[key as keyof CreateCustomerRequest];
      if (value === '' || value === undefined) {
        delete cleanedData[key as keyof CreateCustomerRequest];
      }
    });
    
    const response = await httpClient.post<ApiResponse<Customer>>('/api/v1/customers', cleanedData);
    return response.data;
  },

  // Update existing customer
  async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<Customer> {
    // Clean up empty string fields that should be null or undefined
    const cleanedData = { ...data };
    
    // Convert empty strings to null for Guid fields
    if (cleanedData.assignedToUserId === '') {
      delete cleanedData.assignedToUserId;
    }
    
    // Remove empty optional fields
    Object.keys(cleanedData).forEach(key => {
      const value = cleanedData[key as keyof UpdateCustomerRequest];
      if (value === '' || value === undefined) {
        delete cleanedData[key as keyof UpdateCustomerRequest];
      }
    });
    
    const response = await httpClient.put<ApiResponse<Customer>>(`/api/v1/customers/${id}`, cleanedData);
    return response.data;
  },

  // Delete customer (soft delete)
  async deleteCustomer(id: string): Promise<void> {
    await httpClient.delete<ApiResponse<void>>(`/api/v1/customers/${id}`);
  },
};
