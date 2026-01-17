'use client';

import { useState } from 'react';
import { useTickets, useDeleteTicket, useCloseTicket, useEscalateTicket } from '@/hooks/useTickets';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import { Plus, Search, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { TicketStatus, TicketPriority } from '@/types';
import Link from 'next/link';

const statusColors: Record<TicketStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [TicketStatus.Open]: 'info',
  [TicketStatus.InProgress]: 'warning',
  [TicketStatus.Resolved]: 'success',
  [TicketStatus.Closed]: 'default',
};

const priorityColors: Record<TicketPriority, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [TicketPriority.Low]: 'default',
  [TicketPriority.Medium]: 'info',
  [TicketPriority.High]: 'warning',
  [TicketPriority.Critical]: 'danger',
};

export default function TicketsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');

  const { data, isLoading } = useTickets({ 
    page, 
    pageSize: 20, 
    search, 
    status: status || undefined,
    priority: priority || undefined,
  });
  const deleteMutation = useDeleteTicket();
  const closeMutation = useCloseTicket();
  const escalateMutation = useEscalateTicket();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Ticket deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete ticket');
    }
  };

  const handleClose = async (id: string) => {
    const resolution = prompt('Resolution:');
    if (!resolution) return;

    try {
      await closeMutation.mutateAsync({ id, data: { resolution } });
      toast.success('Ticket closed successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to close ticket');
    }
  };

  const handleEscalate = async (id: string) => {
    if (!confirm('Escalate this ticket?')) return;

    try {
      await escalateMutation.mutateAsync(id);
      toast.success('Ticket escalated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to escalate ticket');
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

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
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">
                  <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                    {ticket.subject}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[ticket.status]}>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityColors[ticket.priority]}>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>{ticket.category || '-'}</TableCell>
                <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {ticket.status !== TicketStatus.Closed && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClose(ticket.id)}
                          disabled={closeMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEscalate(ticket.id)}
                          disabled={escalateMutation.isPending}
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Link href={`/tickets/${ticket.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(ticket.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data && (
          <div className="p-4">
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              totalCount={data.totalCount}
              totalPages={data.totalPages}
              hasNextPage={data.hasNextPage}
              hasPreviousPage={data.hasPreviousPage}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
