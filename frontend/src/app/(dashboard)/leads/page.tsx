'use client';

import { useState } from 'react';
import { useLeads, useDeleteLead, useConvertLead } from '@/hooks/useLeads';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import { Plus, Search, Trash2, UserCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { LeadStatus } from '@/types';
import Link from 'next/link';

const statusColors: Record<LeadStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [LeadStatus.New]: 'info',
  [LeadStatus.Contacted]: 'warning',
  [LeadStatus.Qualified]: 'success',
  [LeadStatus.Lost]: 'danger',
};

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');

  const { data, isLoading } = useLeads({ page, pageSize: 20, search, status: status || undefined });
  const deleteMutation = useDeleteLead();
  const convertMutation = useConvertLead();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Lead deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete lead');
    }
  };

  const handleConvert = async (id: string) => {
    if (!confirm('Convert this lead to a contact and create a deal?')) return;

    try {
      const result = await convertMutation.mutateAsync({ 
        id, 
        data: { createDeal: true } 
      });
      toast.success(`Lead converted! Contact: ${result.contactId}${result.dealId ? `, Deal: ${result.dealId}` : ''}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to convert lead');
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Manage your sales leads</p>
        </div>
        <Link href="/leads/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
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
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">
                  <Link href={`/leads/${lead.id}`} className="hover:underline">
                    {lead.firstName} {lead.lastName}
                  </Link>
                </TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.company || '-'}</TableCell>
                <TableCell>{lead.source || '-'}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[lead.status]}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(lead.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {lead.status === LeadStatus.Qualified && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConvert(lead.id)}
                        disabled={convertMutation.isPending}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Link href={`/leads/${lead.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(lead.id)}
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
