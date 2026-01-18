'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCampaign, useUpdateCampaign } from '@/hooks/useCampaigns';
import { CampaignType, CreateCampaignRequest } from '@/types';
import { Loading } from '@/components/ui/Loading';
import { useTranslation } from '@/hooks/useTranslation';

export default function EditCampaignPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const { data: campaign, isLoading: isLoadingCampaign } = useCampaign(campaignId);
  const updateCampaign = useUpdateCampaign();

  const [formData, setFormData] = useState<CreateCampaignRequest>({
    name: '',
    description: '',
    type: CampaignType.Email,
    startDate: undefined,
    endDate: undefined,
    budget: undefined,
    currency: 'USD',
    expectedRevenue: undefined,
    expectedLeads: undefined,
    expectedConversions: undefined,
    targetAudience: '',
    tags: undefined,
    subject: '',
    content: '',
    segmentId: undefined,
    scheduledDate: undefined,
  });

  // Pre-populate form when campaign loads
  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        type: campaign.type,
        startDate: campaign.startDate || undefined,
        endDate: campaign.endDate || undefined,
        budget: campaign.budget || undefined,
        currency: campaign.currency || 'USD',
        expectedRevenue: campaign.expectedRevenue || undefined,
        expectedLeads: campaign.expectedLeads || undefined,
        expectedConversions: campaign.expectedConversions || undefined,
        targetAudience: campaign.targetAudience || '',
        tags: campaign.tags || undefined,
        subject: campaign.subject || '',
        content: campaign.content,
        segmentId: campaign.segmentId || undefined,
        scheduledDate: campaign.scheduledDate || undefined,
      });
    }
  }, [campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    updateCampaign.mutate(
      { id: campaignId, data: formData },
      {
        onSuccess: () => {
          router.push(`/campaigns/${campaignId}`);
        },
      }
    );
  };

  if (isLoadingCampaign) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/campaigns/${campaignId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('campaigns.editCampaign')}</h1>
          <p className="text-muted-foreground">{t('campaigns.editExistingCampaign')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campaign Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  {t('campaigns.campaignName')} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('campaigns.placeholders.name')}
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  {t('campaigns.description')}
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value || undefined }))}
                  placeholder={t('campaigns.placeholders.description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('campaigns.campaignType')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CampaignType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value={CampaignType.Email}>{t('campaigns.typeLabels.Email')}</option>
                  <option value={CampaignType.SMS}>{t('campaigns.typeLabels.SMS')}</option>
                  <option value={CampaignType.Social}>{t('campaigns.typeLabels.Social')}</option>
                  <option value={CampaignType.Event}>{t('campaigns.typeLabels.Event')}</option>
                  <option value={CampaignType.Webinar}>{t('campaigns.typeLabels.Webinar')}</option>
                  <option value={CampaignType.Advertisement}>{t('campaigns.typeLabels.Advertisement')}</option>
                  <option value={CampaignType.Other}>{t('campaigns.typeLabels.Other')}</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('campaigns.startDate')}</label>
                <Input
                  type="datetime-local"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    startDate: e.target.value || undefined 
                  }))}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('campaigns.endDate')}</label>
                <Input
                  type="datetime-local"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    endDate: e.target.value || undefined 
                  }))}
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('campaigns.budget')}</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    budget: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  placeholder="0.00"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('campaigns.currency')}</label>
                <select
                  value={formData.currency || 'USD'}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="USD">USD</option>
                  <option value="VND">VND</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              {/* Expected Revenue */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('campaigns.expectedRevenue')}</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.expectedRevenue || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    expectedRevenue: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  placeholder="0.00"
                />
              </div>

              {/* Expected Leads */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('campaigns.expectedLeads')}</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.expectedLeads || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    expectedLeads: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="0"
                />
              </div>

              {/* Expected Conversions */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('campaigns.expectedConversions')}</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.expectedConversions || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    expectedConversions: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Subject (for Email/SMS) */}
            {(formData.type === CampaignType.Email || formData.type === CampaignType.SMS) && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('campaigns.subject')} {formData.type === CampaignType.Email && <span className="text-red-500">*</span>}
                </label>
                <Input
                  value={formData.subject || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder={t('campaigns.placeholders.subject')}
                  required={formData.type === CampaignType.Email}
                />
              </div>
            )}

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('campaigns.content')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder={t('campaigns.placeholders.content')}
                rows={formData.type === CampaignType.SMS ? 3 : 10}
                maxLength={formData.type === CampaignType.SMS ? 160 : undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                required
              />
              {formData.type === CampaignType.SMS && (
                <p className="text-xs text-muted-foreground mt-1">
                  {(formData.content || '').length}/160 characters
                </p>
              )}
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('campaigns.targetAudience')}</label>
              <textarea
                value={formData.targetAudience || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  targetAudience: e.target.value || undefined 
                }))}
                placeholder={t('campaigns.placeholders.targetAudience')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('campaigns.tags')}</label>
              <Input
                value={formData.tags || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  tags: e.target.value || undefined 
                }))}
                placeholder={t('campaigns.placeholders.tags')}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('campaigns.placeholders.tagsHelper')}
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={updateCampaign.isPending || !formData.name || !formData.content}
              >
                {updateCampaign.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('common.save')}
              </Button>
              <Link href={`/campaigns/${campaignId}`}>
                <Button type="button" variant="outline">
                  {t('common.cancel')}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
