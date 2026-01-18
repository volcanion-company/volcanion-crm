'use client';

import { useState } from 'react';
import {
  useContracts,
  useDeleteContract,
  useApproveContract,
  useActivateContract,
  useRenewContract,
  useContractStats,
} from '@/hooks/useContracts';
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
  CheckCircle,
  Play,
  RefreshCw,
  FileCheck,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ContractStatus, ContractType } from '@/types';
import Link from 'next/link';

const statusColors: Record<ContractStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [ContractStatus.Draft]: 'default',
  [ContractStatus.PendingApproval]: 'warning',
  [ContractStatus.Approved]: 'info',
  [ContractStatus.Active]: 'success',
  [ContractStatus.Expired]: 'danger',
  [ContractStatus.Cancelled]: 'danger',
  [ContractStatus.Renewed]: 'default',
};

export default function ContractsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useContracts({ page, pageSize: 20 });
  const { data: stats } = useContractStats();
  const deleteMutation = useDeleteContract();
  const approveMutation = useApproveContract();
  const activateMutation = useActivateContract();
  const renewMutation = useRenewContract();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contract?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this contract?')) return;
    try {
      await approveMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleActivate = async (id: string) => {
    if (!confirm('Activate this contract?')) return;
    try {
      await activateMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleRenew = async (id: string) => {
    if (!confirm('Renew this contract?')) return;
    try {
      await renewMutation.mutateAsync(id);
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
                <p className="text-sm text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold">{stats.totalContracts}</p>
              </div>
              <FileCheck className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.activeContracts}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">{stats.expiringSoon}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recurring Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.recurringRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">Manage service contracts and agreements</p>
        </div>
        <Link href="/contracts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
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
              <TableHead>Contract #</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">
                  <Link href={`/contracts/${contract.id}`} className="hover:underline">
                    {contract.contractNumber}
                  </Link>
                </TableCell>
                <TableCell>{contract.title}</TableCell>
                <TableCell>{contract.customerName || '-'}</TableCell>
                <TableCell>
                  <Badge variant="default">{ContractType[contract.type]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[contract.status]}>
                    {ContractStatus[contract.status]}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(contract.value)}</TableCell>
                <TableCell>{formatDate(contract.startDate)}</TableCell>
                <TableCell>
                  {contract.endDate ? (
                    <span
                      className={
                        new Date(contract.endDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          ? 'text-orange-600'
                          : ''
                      }
                    >
                      {formatDate(contract.endDate)}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {contract.status === ContractStatus.PendingApproval && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(contract.id)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {contract.status === ContractStatus.Approved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivate(contract.id)}
                        disabled={activateMutation.isPending}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {(contract.status === ContractStatus.Active ||
                      contract.status === ContractStatus.Expired) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRenew(contract.id)}
                        disabled={renewMutation.isPending}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Link href={`/contracts/${contract.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(contract.id)}
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
