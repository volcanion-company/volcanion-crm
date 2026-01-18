'use client';

import { useState } from 'react';
import { useOpportunities, useDeleteOpportunity, useMarkAsWon, useMarkAsLost } from '@/hooks/useOpportunities';
import { useTranslations } from 'next-intl';
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
import { OpportunityStage } from '@/types';
import Link from 'next/link';

const stageColors: Record<OpportunityStage, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [OpportunityStage.Prospecting]: 'default',
  [OpportunityStage.Qualification]: 'info',
  [OpportunityStage.Proposal]: 'warning',
  [OpportunityStage.Negotiation]: 'warning',
  [OpportunityStage.ClosedWon]: 'success',
  [OpportunityStage.ClosedLost]: 'danger',
};

export default function DealsPage() {
  const t = useTranslations('deals');
  const tCommon = useTranslations('common');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<string>('');

  const { data, isLoading } = useOpportunities({ page, pageSize: 20 });
  const deleteMutation = useDeleteOpportunity();
  const winMutation = useMarkAsWon();
  const loseMutation = useMarkAsLost();

  const handleDelete = async (id: string) => {
    if (!confirm(t('messages.confirmDelete') || 'Are you sure?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t('messages.deleteSuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete opportunity');
    }
  };

  const handleWin = async (id: string) => {
    if (!confirm('Mark this opportunity as won?')) return;

    try {
      await winMutation.mutateAsync(id);
      toast.success('Opportunity marked as won! 🎉');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to win opportunity');
    }
  };

  const handleLose = async (id: string) => {
    const reason = prompt('Reason for losing this opportunity:');
    if (reason === null) return;

    try {
      await loseMutation.mutateAsync({ id, lossReason: reason || undefined });
      toast.success('Opportunity marked as lost');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to lose opportunity');
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
            <option value="Prospecting">Prospecting</option>
            <option value="Qualification">Qualification</option>
            <option value="NeedsAnalysis">Needs Analysis</option>
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
            {data?.items.map((opportunity) => (
              <TableRow key={opportunity.id}>
                <TableCell className="font-medium">
                  <Link href={`/deals/${opportunity.id}`} className="hover:underline">
                    {opportunity.name}
                  </Link>
                </TableCell>
                <TableCell>{formatCurrency(opportunity.amount)}</TableCell>
                <TableCell>
                  <Badge variant={stageColors[opportunity.stage]}>
                    {opportunity.stage}
                  </Badge>
                </TableCell>
                <TableCell>{formatPercent(opportunity.probability)}</TableCell>
                <TableCell>
                  {opportunity.expectedCloseDate ? formatDate(opportunity.expectedCloseDate) : '-'}
                </TableCell>
                <TableCell>{formatDate(opportunity.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {opportunity.stage !== OpportunityStage.ClosedWon && opportunity.stage !== OpportunityStage.ClosedLost && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWin(opportunity.id)}
                          disabled={winMutation.isPending}
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLose(opportunity.id)}
                          disabled={loseMutation.isPending}
                        >
                          <TrendingDown className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Link href={`/deals/${opportunity.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(opportunity.id)}
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
