'use client';

import { useState } from 'react';
import {
  useQuotations,
  useDeleteQuotation,
  useSendQuotation,
  useAcceptQuotation,
  useQuotationStats,
} from '@/hooks/useQuotations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Send,
  CheckCircle,
  FileText,
  TrendingUp,
  DollarSign,
  Clock,
} from 'lucide-react';
import { formatDate, formatCurrency, formatPercent } from '@/lib/utils';
import { QuotationStatus } from '@/types';
import Link from 'next/link';

const statusColors: Record<QuotationStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [QuotationStatus.Draft]: 'default',
  [QuotationStatus.Sent]: 'info',
  [QuotationStatus.Accepted]: 'success',
  [QuotationStatus.Rejected]: 'danger',
  [QuotationStatus.Expired]: 'warning',
  [QuotationStatus.Converted]: 'success',
};

export default function QuotationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuotations({ page, pageSize: 20 });
  const { data: stats } = useQuotationStats();
  const deleteMutation = useDeleteQuotation();
  const sendMutation = useSendQuotation();
  const acceptMutation = useAcceptQuotation();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm('Send this quotation to customer?')) return;
    try {
      await sendMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAccept = async (id: string) => {
    if (!confirm('Mark this quotation as accepted?')) return;
    try {
      await acceptMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Quotations</p>
                <p className="text-2xl font-bold">{stats.totalQuotations}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{formatPercent(stats.conversionRate)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">Create and manage sales quotations</p>
        </div>
        <Link href="/quotations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quotation #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((quotation) => (
              <TableRow key={quotation.id}>
                <TableCell className="font-medium">
                  <Link href={`/quotations/${quotation.id}`} className="hover:underline">
                    {quotation.quotationNumber}
                  </Link>
                </TableCell>
                <TableCell>{quotation.customerName || '-'}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[quotation.status]}>
                    {QuotationStatus[quotation.status]}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(quotation.total)}</TableCell>
                <TableCell>{formatDate(quotation.quotationDate)}</TableCell>
                <TableCell>
                  {quotation.expiryDate ? (
                    <span
                      className={
                        new Date(quotation.expiryDate) < new Date() ? 'text-red-600' : ''
                      }
                    >
                      {formatDate(quotation.expiryDate)}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {quotation.status === QuotationStatus.Draft && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend(quotation.id)}
                        disabled={sendMutation.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    {quotation.status === QuotationStatus.Sent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAccept(quotation.id)}
                        disabled={acceptMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Link href={`/quotations/${quotation.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(quotation.id)}
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
