'use client';

import { useState } from 'react';
import { useDeals, useDeleteDeal, useWinDeal, useLoseDeal } from '@/hooks/useDeals';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import { Plus, Search, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatDate, formatCurrency, formatPercent } from '@/lib/utils';
import { toast } from 'sonner';
import { DealStage } from '@/types';
import Link from 'next/link';

const stageColors: Record<DealStage, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [DealStage.Qualification]: 'info',
  [DealStage.Proposal]: 'warning',
  [DealStage.Negotiation]: 'warning',
  [DealStage.Closing]: 'info',
  [DealStage.Won]: 'success',
  [DealStage.Lost]: 'danger',
};

export default function DealsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<string>('');

  const { data, isLoading } = useDeals({ page, pageSize: 20, search, stage: stage || undefined });
  const deleteMutation = useDeleteDeal();
  const winMutation = useWinDeal();
  const loseMutation = useLoseDeal();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Deal deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete deal');
    }
  };

  const handleWin = async (id: string) => {
    if (!confirm('Mark this deal as won?')) return;

    try {
      await winMutation.mutateAsync(id);
      toast.success('Deal marked as won!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to win deal');
    }
  };

  const handleLose = async (id: string) => {
    const reason = prompt('Reason for losing this deal:');
    if (!reason) return;

    try {
      await loseMutation.mutateAsync({ id, data: { lostReason: reason } });
      toast.success('Deal marked as lost');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to lose deal');
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
          <p className="text-muted-foreground">Manage your sales pipeline</p>
        </div>
        <Link href="/deals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Stages</option>
            <option value="Qualification">Qualification</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closing">Closing</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Expected Close</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell className="font-medium">
                  <Link href={`/deals/${deal.id}`} className="hover:underline">
                    {deal.name}
                  </Link>
                </TableCell>
                <TableCell>{formatCurrency(deal.amount)}</TableCell>
                <TableCell>
                  <Badge variant={stageColors[deal.stage]}>
                    {deal.stage}
                  </Badge>
                </TableCell>
                <TableCell>{formatPercent(deal.probability)}</TableCell>
                <TableCell>
                  {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : '-'}
                </TableCell>
                <TableCell>{formatDate(deal.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {deal.stage !== DealStage.Won && deal.stage !== DealStage.Lost && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWin(deal.id)}
                          disabled={winMutation.isPending}
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLose(deal.id)}
                          disabled={loseMutation.isPending}
                        >
                          <TrendingDown className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Link href={`/deals/${deal.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(deal.id)}
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
