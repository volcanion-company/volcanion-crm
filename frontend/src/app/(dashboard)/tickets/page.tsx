'use client';

import { useState } from 'react';
import { useTickets, useDeleteTicket } from '@/hooks/useTickets';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import { Plus, Search, Trash2, AlertCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TicketStatus, TicketPriority } from '@/types';
import Link from 'next/link';

const statusColors: Record<TicketStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [TicketStatus.New]: 'info',
  [TicketStatus.Open]: 'info',
  [TicketStatus.InProgress]: 'warning',
  [TicketStatus.Pending]: 'default',
  [TicketStatus.OnHold]: 'default',
  [TicketStatus.Resolved]: 'success',
  [TicketStatus.Closed]: 'default',
  [TicketStatus.Reopened]: 'danger',
};

const statusLabels: Record<TicketStatus, string> = {
  [TicketStatus.New]: 'New',
  [TicketStatus.Open]: 'Open',
  [TicketStatus.InProgress]: 'In Progress',
  [TicketStatus.Pending]: 'Pending',
  [TicketStatus.OnHold]: 'On Hold',
  [TicketStatus.Resolved]: 'Resolved',
  [TicketStatus.Closed]: 'Closed',
  [TicketStatus.Reopened]: 'Reopened',
};

const priorityColors: Record<TicketPriority, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [TicketPriority.Low]: 'default',
  [TicketPriority.Medium]: 'info',
  [TicketPriority.High]: 'warning',
  [TicketPriority.Critical]: 'danger',
};

const priorityLabels: Record<TicketPriority, string> = {
  [TicketPriority.Low]: 'Low',
  [TicketPriority.Medium]: 'Medium',
  [TicketPriority.High]: 'High',
  [TicketPriority.Critical]: 'Critical',
};

export default function TicketsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | undefined>();

  const { data, isLoading } = useTickets({
    page,
    pageSize: 20,
    search,
    status: statusFilter,
    priority: priorityFilter,
  });
  const deleteMutation = useDeleteTicket();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    await deleteMutation.mutateAsync(id);
  };

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  const tickets = data?.items || [];
  const totalPages = data?.totalPages || 0;
  const totalCount = data?.totalCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">Manage customer support tickets</p>
        </div>
        <Link href="/tickets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Ticket
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket number or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter?.toString() || ''}
            onChange={(e) => setStatusFilter(e.target.value ? Number(e.target.value) as TicketStatus : undefined)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={priorityFilter?.toString() || ''}
            onChange={(e) => setPriorityFilter(e.target.value ? Number(e.target.value) as TicketPriority : undefined)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Priority</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket #</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-sm">
                    <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                      {ticket.ticketNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                      {ticket.subject}
                    </Link>
                    {ticket.slaBreached && (
                      <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                        <AlertCircle className="h-3 w-3" />
                        SLA Breached
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{ticket.customerName || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[ticket.status]}>
                      {statusLabels[ticket.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityColors[ticket.priority]}>
                      {priorityLabels[ticket.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{ticket.assignedToUserName || 'Unassigned'}</TableCell>
                  <TableCell className="text-sm">
                    {ticket.dueDate ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatDate(ticket.dueDate)}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(ticket.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/tickets/${ticket.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(ticket.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <Pagination
          page={page}
          pageSize={data?.pageSize || 10}
          totalCount={data?.totalCount || 0}
          totalPages={totalPages}
          hasNextPage={data?.hasNextPage || false}
          hasPreviousPage={data?.hasPreviousPage || false}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
