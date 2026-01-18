'use client';

import { useState, useEffect } from 'react';
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import { Plus, Search, Trash2, Building2, User, Mail, Phone, Loader2 } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { CustomerStatus, CustomerType } from '@/types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const statusColors: Record<CustomerStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [CustomerStatus.Prospect]: 'info',
  [CustomerStatus.Active]: 'success',
  [CustomerStatus.Inactive]: 'warning',
  [CustomerStatus.Churned]: 'danger',
};

export default function CustomersPage() {
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CustomerType | ''>('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | ''>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  // Debounce search with 500ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, error } = useCustomers({
    pageNumber: currentPage,
    pageSize: 10,
    search: debouncedSearch || undefined,
    type: typeFilter === '' ? undefined : typeFilter,
    status: statusFilter === '' ? undefined : statusFilter,
  });

  const deleteCustomer = useDeleteCustomer();

  const handleDeleteClick = (id: string) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (customerToDelete) {
      deleteCustomer.mutate(customerToDelete);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500">{tCommon('error')}: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Link href="/customers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('actions.create')}
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value === '' ? '' : Number(e.target.value) as CustomerType)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">{t('filters.allTypes')}</option>
              <option value={CustomerType.Individual}>{t('type.Individual')}</option>
              <option value={CustomerType.Business}>{t('type.Business')}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value === '' ? '' : Number(e.target.value) as CustomerStatus)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">{t('filters.allStatus')}</option>
              <option value={CustomerStatus.Prospect}>{t('status.Prospect')}</option>
              <option value={CustomerStatus.Active}>{t('status.Active')}</option>
              <option value={CustomerStatus.Inactive}>{t('status.Inactive')}</option>
              <option value={CustomerStatus.Churned}>{t('status.Churned')}</option>
            </select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('fields.type')}</TableHead>
                  <TableHead>{t('fields.name')}</TableHead>
                  <TableHead>{t('fields.email')}</TableHead>
                  <TableHead>{t('fields.phone')}</TableHead>
                  <TableHead>{t('fields.status')}</TableHead>
                  <TableHead>{t('fields.lifetimeValue')}</TableHead>
                  <TableHead>{t('fields.createdAt')}</TableHead>
                  <TableHead className="text-right">{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {t('noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.items?.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        {customer.type === CustomerType.Business ? (
                          <Building2 className="h-5 w-5 text-blue-500" />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/customers/${customer.id}`} className="hover:underline">
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {customer.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {customer.email}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {customer.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[customer.status]}>
                          {t(`status.${CustomerStatus[customer.status]}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {customer.lifetimeValue ? formatCurrency(customer.lifetimeValue) : '-'}
                      </TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/customers/${customer.id}`}>
                            <Button variant="outline" size="sm">
                              {tCommon('view')}
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(customer.id)}
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
          </div>

          {data && data.totalPages > 1 && (
            <Pagination
              page={currentPage}
              pageSize={data.pageSize}
              totalCount={data.totalCount}
              totalPages={data.totalPages}
              hasNextPage={data.hasNextPage}
              hasPreviousPage={data.hasPreviousPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('deleteDialog.title')}</h2>
            <p className="text-muted-foreground mb-6">{t('deleteDialog.message')}</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setCustomerToDelete(null);
                }}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteCustomer.isPending}
              >
                {deleteCustomer.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon('deleting')}
                  </>
                ) : (
                  tCommon('delete')
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
