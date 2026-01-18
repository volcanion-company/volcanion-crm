import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '@/services/ticket.service';
import type {
  CreateTicketRequest,
  UpdateTicketRequest,
  AssignTicketRequest,
  PauseSLARequest,
  PaginationParams,
  TicketStatus,
  TicketPriority,
} from '@/types';
import { toast } from 'sonner';

export const useTickets = (
  params?: PaginationParams & {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
    customerId?: string;
  }
) => {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => ticketService.getTickets(params),
  });
};

export const useMyTickets = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['tickets', 'my-tickets', params],
    queryFn: () => ticketService.getMyTickets(params),
  });
};

export const useOverdueTickets = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['tickets', 'overdue', params],
    queryFn: () => ticketService.getOverdueTickets(params),
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => ticketService.getTicket(id),
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketRequest) => ticketService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create ticket');
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketRequest }) =>
      ticketService.updateTicket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
      toast.success('Ticket updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update ticket');
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete ticket');
    },
  });
};

export const useAssignTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignTicketRequest }) =>
      ticketService.assignTicket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
      toast.success('Ticket assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign ticket');
    },
  });
};

export const useResolveTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.resolveTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket resolved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resolve ticket');
    },
  });
};

export const useCloseTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.closeTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket closed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to close ticket');
    },
  });
};

export const usePauseSLA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PauseSLARequest }) =>
      ticketService.pauseSLA(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('SLA paused successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to pause SLA');
    },
  });
};

export const useResumeSLA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.resumeSLA(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('SLA resumed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resume SLA');
    },
  });
};

export const useEscalateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.escalateTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket escalated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to escalate ticket');
    },
  });
};
