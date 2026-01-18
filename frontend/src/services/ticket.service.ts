import { httpClient } from '@/lib/http-client';
import type {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  AssignTicketRequest,
  PauseSLARequest,
  PaginatedResponse,
  PaginationParams,
  TicketStatus,
  TicketPriority,
} from '@/types';

const BASE_URL = '/api/v1/tickets';

export const ticketService = {
  // Get all tickets with pagination and filters
  async getTickets(
    params?: PaginationParams & {
      status?: TicketStatus;
      priority?: TicketPriority;
      assignedTo?: string;
      customerId?: string;
    }
  ): Promise<PaginatedResponse<Ticket>> {
    return await httpClient.get<PaginatedResponse<Ticket>>(BASE_URL, { params });
  },

  // Get my tickets
  async getMyTickets(params?: PaginationParams): Promise<PaginatedResponse<Ticket>> {
    return await httpClient.get<PaginatedResponse<Ticket>>(`${BASE_URL}/my-tickets`, { params });
  },

  // Get overdue tickets
  async getOverdueTickets(params?: PaginationParams): Promise<Ticket[]> {
    return await httpClient.get<Ticket[]>(`${BASE_URL}/overdue`, { params });
  },

  // Get single ticket by ID
  async getTicket(id: string): Promise<Ticket> {
    return await httpClient.get<Ticket>(`${BASE_URL}/${id}`);
  },

  // Create new ticket
  async createTicket(data: CreateTicketRequest): Promise<Ticket> {
    return await httpClient.post<Ticket>(BASE_URL, data);
  },

  // Update existing ticket
  async updateTicket(id: string, data: UpdateTicketRequest): Promise<Ticket> {
    return await httpClient.put<Ticket>(`${BASE_URL}/${id}`, data);
  },

  // Delete ticket
  async deleteTicket(id: string): Promise<void> {
    await httpClient.delete(`${BASE_URL}/${id}`);
  },

  // Assign ticket to user
  async assignTicket(id: string, data: AssignTicketRequest): Promise<Ticket> {
    return await httpClient.post<Ticket>(`${BASE_URL}/${id}/assign`, data);
  },

  // Resolve ticket
  async resolveTicket(id: string): Promise<void> {
    await httpClient.post(`${BASE_URL}/${id}/resolve`);
  },

  // Close ticket
  async closeTicket(id: string): Promise<void> {
    await httpClient.post(`${BASE_URL}/${id}/close`);
  },

  // Pause SLA
  async pauseSLA(id: string, data: PauseSLARequest): Promise<void> {
    await httpClient.post(`${BASE_URL}/${id}/pause-sla`, data);
  },

  // Resume SLA
  async resumeSLA(id: string): Promise<void> {
    await httpClient.post(`${BASE_URL}/${id}/resume-sla`);
  },

  // Escalate ticket
  async escalateTicket(id: string): Promise<void> {
    await httpClient.post(`${BASE_URL}/${id}/escalate`);
  },
};
