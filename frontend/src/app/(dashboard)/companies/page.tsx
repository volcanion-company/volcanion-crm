'use client';

import { useState } from 'react';
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomers';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import { Plus, Search, Trash2, Edit, Building2, Users, TrendingUp } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { CustomerStatus, CustomerType } from '@/types';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

const statusColors: Record<CustomerStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  [CustomerStatus.Active]: 'success',
  [CustomerStatus.Inactive]: 'default',
  [CustomerStatus.Prospect]: 'warning',
  [CustomerStatus.Churned]: 'danger',
};

const typeColors: Record<CustomerType, 'default' | 'info'> = {
  [CustomerType.Individual]: 'default',
  [CustomerType.Business]: 'info',
};

export default function CompaniesPage() {
  const t = useTranslations('companies');
  const tCommon = useTranslations('common');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useCustomers({ page, pageSize: 20 });
  const deleteMutation = useDeleteCustomer();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error toast handled by hook
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">Manage your customer accounts</p>
        </div>
        <Link href="/companies/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={tCommon('search') + '...'}
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
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Lifetime Value</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items?.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <Link href={`/companies/${customer.id}`} className="hover:underline">
                    {customer.firstName} {customer.lastName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={typeColors[customer.type]}>
                    {customer.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[customer.status]}>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone || '-'}</TableCell>
                <TableCell>{formatCurrency(customer.lifetimeValue || 0)}</TableCell>
                <TableCell>{formatDate(customer.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/companies/${customer.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(customer.id)}
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
