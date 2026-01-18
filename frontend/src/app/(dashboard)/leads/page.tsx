'use client';

import { useState, useEffect } from 'react';
import { useLeads, useDeleteLead, useConvertLead } from '@/hooks/useLeads';
import { useTranslations } from 'next-intl';
import { useDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import { Plus, Search, Trash2, UserCheck, Mail, Phone, TrendingUp, Star, Building2 } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { LeadStatus, LeadRating, LeadSource } from '@/types';
import Link from 'next/link';

const statusColors: Record<LeadStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [LeadStatus.New]: 'info',
  [LeadStatus.Contacted]: 'warning',
  [LeadStatus.Qualified]: 'success',
  [LeadStatus.Unqualified]: 'default',
  [LeadStatus.Converted]: 'success',
  [LeadStatus.Lost]: 'danger',
};

const ratingColors: Record<LeadRating, 'default' | 'warning' | 'danger'> = {
  [LeadRating.Cold]: 'default',
  [LeadRating.Warm]: 'warning',
  [LeadRating.Hot]: 'danger',
};

export default function LeadsPage() {
  const t = useTranslations('leads');
  const tCommon = useTranslations('common');
  const { showDialog } = useDialog();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [rating, setRating] = useState<LeadRating | ''>('');
  const [source, setSource] = useState<LeadSource | ''>('');

  const { data, isLoading } = useLeads({ 
    pageNumber: page, 
    pageSize: 20, 
    search: debouncedSearchTerm, 
    status: status === '' ? undefined : status,
    rating: rating === '' ? undefined : rating,
    source: source === '' ? undefined : source
  });
  const deleteMutation = useDeleteLead();
  const convertMutation = useConvertLead();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, status, rating, source]);

  const handleDelete = async (id: string) => {
    const confirmed = await showDialog({
      title: t('messages.confirmDelete'),
      description: t('messages.confirmDeleteMessage'),
      confirmText: tCommon('delete'),
      cancelText: tCommon('cancel'),
      variant: 'destructive',
    });

    if (!confirmed) return;

    await deleteMutation.mutateAsync(id);
  };

  const handleConvert = async (id: string) => {
    const confirmed = await showDialog({
      title: t('messages.confirmConvert'),
      description: t('messages.confirmConvertMessage'),
      confirmText: t('actions.convert'),
      cancelText: tCommon('cancel'),
    });

    if (!confirmed) return;

    await convertMutation.mutateAsync({ 
      id, 
      data: { createOpportunity: true } 
    });
  };

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('manageLeads')}</p>
        </div>
        <Link href="/leads/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('newLead')}
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value ? parseInt(e.target.value) as LeadStatus : '')}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('allStatus')}</option>
            <option value={LeadStatus.New}>{t('statuses.New')}</option>
            <option value={LeadStatus.Contacted}>{t('statuses.Contacted')}</option>
            <option value={LeadStatus.Qualified}>{t('statuses.Qualified')}</option>
            <option value={LeadStatus.Unqualified}>{t('statuses.Unqualified')}</option>
            <option value={LeadStatus.Converted}>{t('statuses.Converted')}</option>
            <option value={LeadStatus.Lost}>{t('statuses.Lost')}</option>
          </select>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value ? parseInt(e.target.value) as LeadRating : '')}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('allRatings')}</option>
            <option value={LeadRating.Cold}>{t('ratings.Cold')}</option>
            <option value={LeadRating.Warm}>{t('ratings.Warm')}</option>
            <option value={LeadRating.Hot}>{t('ratings.Hot')}</option>
          </select>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value ? parseInt(e.target.value) as LeadSource : '')}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('allSources')}</option>
            <option value={LeadSource.Website}>{t('sources.Website')}</option>
            <option value={LeadSource.Referral}>{t('sources.Referral')}</option>
            <option value={LeadSource.SocialMedia}>{t('sources.SocialMedia')}</option>
            <option value={LeadSource.Email}>{t('sources.Email')}</option>
            <option value={LeadSource.Phone}>{t('sources.Phone')}</option>
            <option value={LeadSource.TradeShow}>{t('sources.TradeShow')}</option>
            <option value={LeadSource.Partner}>{t('sources.Partner')}</option>
            <option value={LeadSource.Advertisement}>{t('sources.Advertisement')}</option>
            <option value={LeadSource.ColdCall}>{t('sources.ColdCall')}</option>
            <option value={LeadSource.Other}>{t('sources.Other')}</option>
          </select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('leadTitle')}</TableHead>
              <TableHead>{t('fullName')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('phone')}</TableHead>
              <TableHead>{t('companyName')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('rating')}</TableHead>
              <TableHead>{t('source')}</TableHead>
              <TableHead>{t('estimatedValue')}</TableHead>
              <TableHead>{t('assignedTo')}</TableHead>
              <TableHead>{t('createdAt')}</TableHead>
              <TableHead className="text-right">{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items && data.items.length > 0 ? (
              data.items.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <Link href={`/leads/${lead.id}`} className="hover:underline">
                      {lead.title}
                    </Link>
                  </TableCell>
                  <TableCell>{lead.fullName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {lead.email ? (
                        <>
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {lead.email}
                        </>
                      ) : (
                        '-'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {lead.phone ? (
                        <>
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {lead.phone}
                        </>
                      ) : (
                        '-'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {lead.companyName ? (
                        <>
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {lead.companyName}
                        </>
                      ) : (
                        '-'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[lead.status]}>
                      {t(`statuses.${LeadStatus[lead.status]}` as any)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <Badge variant={ratingColors[lead.rating]}>
                        {t(`ratings.${LeadRating[lead.rating]}` as any)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {t(`sources.${LeadSource[lead.source]}` as any)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {lead.estimatedValue ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          {formatCurrency(lead.estimatedValue)}
                        </>
                      ) : (
                        '-'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{lead.assignedToUserName || '-'}</TableCell>
                  <TableCell>{formatDate(lead.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {lead.status === LeadStatus.Qualified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConvert(lead.id)}
                          disabled={convertMutation.isPending}
                          title={t('actions.convert')}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Link href={`/leads/${lead.id}`}>
                        <Button variant="outline" size="sm">
                          {tCommon('edit')}
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(lead.id)}
                        disabled={deleteMutation.isPending}
                        title={tCommon('delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                  {t('noLeadsFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {data && data.totalCount > 0 && (
          <div className="p-4">
            <Pagination
              page={data.pageNumber || 1}
              pageSize={data.pageSize || 20}
              totalCount={data.totalCount || 0}
              totalPages={data.totalPages || 0}
              hasNextPage={data.hasNextPage || false}
              hasPreviousPage={data.hasPreviousPage || false}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
