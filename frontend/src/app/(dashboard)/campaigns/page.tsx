'use client';

import { useState, useEffect } from 'react';
import { useCampaigns, useDeleteCampaign, useActivateCampaign } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import { Plus, Search, Trash2, Send, Eye, Edit, Mail, MessageSquare, Share2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CampaignType, CampaignStatus } from '@/types';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { useDialog } from '@/components/ui/Dialog';
import { useTranslation } from '@/hooks/useTranslation';

const typeIcons: Record<CampaignType, LucideIcon> = {
  [CampaignType.Email]: Mail,
  [CampaignType.SMS]: MessageSquare,
  [CampaignType.Social]: Share2,
  [CampaignType.Event]: Mail,
  [CampaignType.Webinar]: Mail,
  [CampaignType.Advertisement]: Mail,
  [CampaignType.Other]: Mail,
};

const typeColors: Record<CampaignType, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [CampaignType.Email]: 'info',
  [CampaignType.SMS]: 'success',
  [CampaignType.Social]: 'warning',
  [CampaignType.Event]: 'default',
  [CampaignType.Webinar]: 'info',
  [CampaignType.Advertisement]: 'danger',
  [CampaignType.Other]: 'default',
};

const statusColors: Record<CampaignStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [CampaignStatus.Draft]: 'default',
  [CampaignStatus.Scheduled]: 'info',
  [CampaignStatus.InProgress]: 'success',
  [CampaignStatus.Paused]: 'warning',
  [CampaignStatus.Completed]: 'success',
  [CampaignStatus.Cancelled]: 'danger',
};

export default function CampaignsPage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<CampaignType | ''>('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');

  const { showDialog } = useDialog();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, typeFilter, statusFilter]);

  const { data, isLoading, error } = useCampaigns({
    page: currentPage,
    pageSize: 10,
    search: debouncedSearchTerm || undefined,
    type: typeFilter === '' ? undefined : typeFilter,
    status: statusFilter === '' ? undefined : statusFilter,
  });

  const deleteCampaign = useDeleteCampaign();
  const activateCampaign = useActivateCampaign();

  const handleDelete = async (id: string) => {
    const confirmed = await showDialog({
      title: t('campaigns.messages.confirmDelete'),
      message: t('campaigns.messages.confirmDeleteMessage'),
      type: 'error',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    });
    
    if (confirmed) {
      deleteCampaign.mutate(id);
    }
  };

  const handleActivate = async (id: string) => {
    const confirmed = await showDialog({
      title: t('campaigns.messages.confirmActivate'),
      message: t('campaigns.messages.confirmActivateMessage'),
      type: 'warning',
      confirmText: t('campaigns.actions.activate'),
      cancelText: t('common.cancel'),
    });
    
    if (confirmed) {
      activateCampaign.mutate(id);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('campaigns.title')}</h1>
          <p className="text-muted-foreground">{t('campaigns.manageCampaigns')}</p>
        </div>
        <Link href="/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('campaigns.newCampaign')}
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
                  placeholder={t('campaigns.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as CampaignType | '')}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">{t('campaigns.allTypes')}</option>
              <option value={CampaignType.Email}>{t('campaigns.types.Email')}</option>
              <option value={CampaignType.SMS}>{t('campaigns.types.SMS')}</option>
              <option value={CampaignType.Social}>{t('campaigns.types.Social')}</option>
              <option value={CampaignType.Event}>{t('campaigns.types.Event')}</option>
              <option value={CampaignType.Webinar}>{t('campaigns.types.Webinar')}</option>
              <option value={CampaignType.Advertisement}>{t('campaigns.types.Advertisement')}</option>
              <option value={CampaignType.Other}>{t('campaigns.types.Other')}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | '')}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">{t('campaigns.allStatus')}</option>
              <option value={CampaignStatus.Draft}>{t('campaigns.statuses.Draft')}</option>
              <option value={CampaignStatus.Scheduled}>{t('campaigns.statuses.Scheduled')}</option>
              <option value={CampaignStatus.InProgress}>{t('campaigns.statuses.InProgress')}</option>
              <option value={CampaignStatus.Paused}>{t('campaigns.statuses.Paused')}</option>
              <option value={CampaignStatus.Completed}>{t('campaigns.statuses.Completed')}</option>
              <option value={CampaignStatus.Cancelled}>{t('campaigns.statuses.Cancelled')}</option>
            </select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('campaigns.type')}</TableHead>
                  <TableHead>{t('campaigns.name')}</TableHead>
                  <TableHead>{t('campaigns.status')}</TableHead>
                  <TableHead>{t('campaigns.startDate')}</TableHead>
                  <TableHead>{t('campaigns.endDate')}</TableHead>
                  <TableHead>{t('common.created')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {t('campaigns.noCampaignsFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.items?.map((campaign) => {
                    const TypeIcon = typeIcons[campaign.type];
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-5 w-5 text-muted-foreground" />
                            <Badge variant={typeColors[campaign.type]}>
                              {t(`campaigns.types.${campaign.type}`)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/campaigns/${campaign.id}`} className="hover:underline">
                            {campaign.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[campaign.status]}>
                            {t(`campaigns.statuses.${campaign.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.startDate ? formatDate(campaign.startDate) : '-'}
                        </TableCell>
                        <TableCell>
                          {campaign.endDate ? formatDate(campaign.endDate) : '-'}
                        </TableCell>
                        <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/campaigns/${campaign.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/campaigns/${campaign.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            {campaign.status === CampaignStatus.Draft && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActivate(campaign.id)}
                                disabled={activateCampaign.isPending}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(campaign.id)}
                              disabled={deleteCampaign.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
    </div>
  );
}
