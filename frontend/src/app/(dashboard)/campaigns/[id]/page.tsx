'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCampaign, useCampaignPerformance, useDeleteCampaign, useActivateCampaign } from '@/hooks/useCampaigns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Send, 
  Calendar, 
  Mail, 
  MessageSquare, 
  Share2,
  TrendingUp,
  Users,
  MousePointerClick,
  CheckCircle
} from 'lucide-react';
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

const statusColors: Record<CampaignStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [CampaignStatus.Draft]: 'default',
  [CampaignStatus.Scheduled]: 'info',
  [CampaignStatus.InProgress]: 'success',
  [CampaignStatus.Paused]: 'warning',
  [CampaignStatus.Completed]: 'success',
  [CampaignStatus.Cancelled]: 'danger',
};

export default function CampaignDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const { showDialog } = useDialog();

  const { data: campaign, isLoading } = useCampaign(campaignId);
  const { data: performance } = useCampaignPerformance(campaignId);
  const deleteCampaign = useDeleteCampaign();
  const activateCampaign = useActivateCampaign();

  // Debug logging
  console.log('Campaign data:', campaign);
  console.log('Performance data:', performance);

  const handleDelete = async () => {
    const confirmed = await showDialog({
      title: t('campaigns.messages.confirmDelete'),
      message: t('campaigns.messages.confirmDeleteMessage'),
      type: 'error',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    });
    
    if (confirmed) {
      deleteCampaign.mutate(campaignId, {
        onSuccess: () => {
          router.push('/campaigns');
        },
      });
    }
  };

  const handleActivate = async () => {
    const confirmed = await showDialog({
      title: t('campaigns.messages.confirmActivate'),
      message: t('campaigns.messages.confirmActivateMessage'),
      type: 'warning',
      confirmText: t('campaigns.actions.activate'),
      cancelText: t('common.cancel'),
    });
    
    if (confirmed) {
      activateCampaign.mutate(campaignId);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('campaigns.noCampaignsFound')}</p>
        <Link href="/campaigns">
          <Button className="mt-4">{t('common.back')}</Button>
        </Link>
      </div>
    );
  }

  const TypeIcon = typeIcons[campaign.type];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/campaigns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back')}
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <TypeIcon className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <Badge variant={statusColors[campaign.status]}>{t(`campaigns.statuses.${campaign.status}`)}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {campaign.status === CampaignStatus.Draft && (
            <Button 
              onClick={handleActivate}
              disabled={activateCampaign.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {t('campaigns.actions.activate')}
            </Button>
          )}
          <Link href={`/campaigns/${campaignId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              {t('common.edit')}
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={handleDelete}
            disabled={deleteCampaign.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      {/* Performance Stats - Only show if campaign has been sent */}
      {campaign.status !== CampaignStatus.Draft && performance && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('campaigns.metrics.sent')}</p>
                <p className="text-2xl font-bold">{performance.totalSent || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('campaigns.metrics.opened')}</p>
                <p className="text-2xl font-bold">{performance.totalOpened || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {performance.openRate?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <MousePointerClick className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('campaigns.metrics.clicked')}</p>
                <p className="text-2xl font-bold">{performance.totalClicked || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {performance.clickRate?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-orange-100 p-3">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('campaigns.metrics.converted')}</p>
                <p className="text-2xl font-bold">{performance.totalConversions || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {performance.conversionRate?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Campaign Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('campaigns.campaignDetails')}</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">{t('campaigns.name')}</p>
              <p className="font-medium">{campaign.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('campaigns.type')}</p>
              <p className="font-medium">{t(`campaigns.types.${campaign.type}`)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('campaigns.status')}</p>
              <Badge variant={statusColors[campaign.status]}>{t(`campaigns.statuses.${campaign.status}`)}</Badge>
            </div>
            {campaign.subject && (
              <div>
                <p className="text-sm text-muted-foreground">{t('campaigns.subject')}</p>
                <p className="font-medium">{campaign.subject}</p>
              </div>
            )}
            {campaign.content && (
              <div>
                <p className="text-sm text-muted-foreground">{t('campaigns.content')}</p>
                <pre className="mt-2 p-3 bg-muted rounded text-sm whitespace-pre-wrap">
                  {campaign.content}
                </pre>
              </div>
            )}
            {campaign.targetAudience && (
              <div>
                <p className="text-sm text-muted-foreground">{t('campaigns.targetAudience')}</p>
                <p className="font-medium">{campaign.targetAudience}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('campaigns.campaignInformation')}</h2>
          <div className="space-y-3">
            {campaign.budget !== undefined && (
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t('campaigns.budget')}</p>
                  <p className="font-medium">{campaign.currency || 'USD'} {campaign.budget.toFixed(2)}</p>
                </div>
              </div>
            )}
            {campaign.actualCost !== undefined && (
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t('campaigns.actualCost')}</p>
                  <p className="font-medium">{campaign.currency || 'USD'} {campaign.actualCost.toFixed(2)}</p>
                </div>
              </div>
            )}
            {campaign.expectedRevenue !== undefined && (
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t('campaigns.expectedRevenue')}</p>
                  <p className="font-medium">{campaign.currency || 'USD'} {campaign.expectedRevenue.toFixed(2)}</p>
                </div>
              </div>
            )}
            {campaign.actualRevenue !== undefined && (
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t('campaigns.actualRevenue')}</p>
                  <p className="font-medium">{campaign.currency || 'USD'} {campaign.actualRevenue.toFixed(2)}</p>
                </div>
              </div>
            )}
            {campaign.ownerName && (
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t('campaigns.owner')}</p>
                  <p className="font-medium">{campaign.ownerName}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('campaigns.startDate')}</p>
                <p className="font-medium">{campaign.startDate ? formatDate(campaign.startDate) : '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('campaigns.endDate')}</p>
                <p className="font-medium">{campaign.endDate ? formatDate(campaign.endDate) : '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Send className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('campaigns.sentDate')}</p>
                <p className="font-medium">{campaign.sentDate ? formatDate(campaign.sentDate) : '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('common.created')}</p>
                <p className="font-medium">{formatDate(campaign.createdAt)}</p>
              </div>
            </div>
            {campaign.updatedAt && (
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
                  <p className="font-medium">{formatDate(campaign.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
