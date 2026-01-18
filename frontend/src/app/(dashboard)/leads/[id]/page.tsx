'use client';

import { useState, use } from 'react';
import { useLead, useDeleteLead, useAssignLead, useConvertLead } from '@/hooks/useLeads';
import { useDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { 
  ArrowLeft, 
  UserCheck, 
  Trash2, 
  UserPlus, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  TrendingUp, 
  Star,
  Calendar,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LeadStatus, LeadRating, LeadSource } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';

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

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const t = useTranslations('leads');
  const tCommon = useTranslations('common');
  const { showDialog } = useDialog();
  
  const { data: lead, isLoading } = useLead(resolvedParams.id);
  const deleteMutation = useDeleteLead();
  const convertMutation = useConvertLead();
  const assignMutation = useAssignLead();
  
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [convertData, setConvertData] = useState({
    customerName: '',
    createOpportunity: true,
  });

  const handleDelete = async () => {
    const confirmed = await showDialog({
      title: t('messages.confirmDelete'),
      description: t('messages.confirmDeleteMessage'),
      confirmText: tCommon('delete'),
      cancelText: tCommon('cancel'),
      variant: 'destructive',
    });

    if (!confirmed) return;

    await deleteMutation.mutateAsync(resolvedParams.id);
    router.push('/leads');
  };

  const handleAssign = async () => {
    if (!assignUserId) return;

    await assignMutation.mutateAsync({
      id: resolvedParams.id,
      data: { userId: assignUserId },
    });
    setAssignDialogOpen(false);
    setAssignUserId('');
  };

  const handleConvert = async () => {
    await convertMutation.mutateAsync({ 
      id: resolvedParams.id, 
      data: convertData 
    });
    setConvertDialogOpen(false);
    router.push('/contacts');
  };

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">{t('noLeadsFound')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tCommon('back')}
          </Button>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{lead.title}</h1>
            <p className="text-muted-foreground mt-1">{lead.fullName}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/leads/${lead.id}/edit`}>
              <Button variant="outline">
                {tCommon('edit')}
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t('actions.assign')}
            </Button>
            {lead.status === LeadStatus.Qualified && !lead.convertedAt && (
              <Button
                variant="default"
                onClick={() => setConvertDialogOpen(true)}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {t('actions.convert')}
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lead Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('leadInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('status')}</p>
              <Badge variant={statusColors[lead.status]} className="mt-1">
                {t(`statuses.${LeadStatus[lead.status]}` as any)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4" />
                {t('rating')}
              </p>
              <Badge variant={ratingColors[lead.rating]} className="mt-1">
                {t(`ratings.${LeadRating[lead.rating]}` as any)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('source')}</p>
              <p className="font-medium mt-1">
                {t(`sourceLabels.${LeadSource[lead.source]}` as any)}
              </p>
              {lead.sourceDetail && (
                <p className="text-sm text-muted-foreground mt-1">{lead.sourceDetail}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('estimatedValue')}
              </p>
              <p className="font-medium mt-1">
                {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('score')}</p>
              <p className="font-medium mt-1">{lead.score}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('assignedTo')}
              </p>
              <p className="font-medium mt-1">{lead.assignedToUserName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('createdAt')}
              </p>
              <p className="font-medium mt-1">{formatDate(lead.createdAt)}</p>
            </div>
            {lead.convertedAt && (
              <div>
                <p className="text-sm text-muted-foreground">{t('convertedAt')}</p>
                <p className="font-medium mt-1">{formatDate(lead.convertedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('contactInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('leadTitle')}</p>
              <p className="font-medium mt-1">{lead.title || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('firstName')}</p>
              <p className="font-medium mt-1">{lead.firstName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('lastName')}</p>
              <p className="font-medium mt-1">{lead.lastName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t('email')}
              </p>
              {lead.email ? (
                <a href={`mailto:${lead.email}`} className="font-medium mt-1 hover:underline">
                  {lead.email}
                </a>
              ) : (
                <p className="font-medium mt-1">-</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t('phone')}
              </p>
              {lead.phone ? (
                <a href={`tel:${lead.phone}`} className="font-medium mt-1 hover:underline">
                  {lead.phone}
                </a>
              ) : (
                <p className="font-medium mt-1">-</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('mobile')}</p>
              {lead.mobile ? (
                <a href={`tel:${lead.mobile}`} className="font-medium mt-1 hover:underline">
                  {lead.mobile}
                </a>
              ) : (
                <p className="font-medium mt-1">-</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('companyInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {t('companyName')}
              </p>
              <p className="font-medium mt-1">{lead.companyName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('jobTitle')}</p>
              <p className="font-medium mt-1">{lead.jobTitle || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('industry')}</p>
              <p className="font-medium mt-1">{lead.industry || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('employeeCount')}</p>
              <p className="font-medium mt-1">{lead.employeeCount || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('addressInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('addressLine1')}
              </p>
              <p className="font-medium mt-1">{lead.addressLine1 || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('city')}</p>
              <p className="font-medium mt-1">{lead.city || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('state')}</p>
              <p className="font-medium mt-1">{lead.state || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('country')}</p>
              <p className="font-medium mt-1">{lead.country || '-'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {lead.description && (
        <Card>
          <CardHeader>
            <CardTitle>{t('description')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{lead.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Assign Dialog */}
      {assignDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('actions.assign')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('messages.confirmAssignMessage')}
              </p>
              <div>
                <label className="text-sm font-medium">{t('assignedTo')}</label>
                <Input
                  type="text"
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  placeholder="User ID"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                  {tCommon('cancel')}
                </Button>
                <Button 
                  onClick={handleAssign}
                  disabled={!assignUserId || assignMutation.isPending}
                >
                  {t('actions.assign')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Convert Dialog */}
      {convertDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('actions.convert')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('messages.confirmConvertMessage')}
              </p>
              <div>
                <label className="text-sm font-medium">Customer Name</label>
                <Input
                  type="text"
                  value={convertData.customerName}
                  onChange={(e) => setConvertData({ ...convertData, customerName: e.target.value })}
                  placeholder={lead.companyName || lead.fullName}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="createOpportunity"
                  checked={convertData.createOpportunity}
                  onChange={(e) => setConvertData({ ...convertData, createOpportunity: e.target.checked })}
                />
                <label htmlFor="createOpportunity" className="text-sm">
                  Create Opportunity
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
                  {tCommon('cancel')}
                </Button>
                <Button 
                  onClick={handleConvert}
                  disabled={convertMutation.isPending}
                >
                  {t('actions.convert')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('estimatedValue')}</p>
              <p className="font-medium">{lead.estimatedValue ? formatCurrency(lead.estimatedValue) : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('assignedTo')}</p>
              <p className="font-medium">{lead.assignedToUserName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{tCommon('createdAt')}</p>
              <p className="font-medium">{formatDate(lead.createdAt)}</p>
            </div>
            {lead.convertedAt && (
              <div>
                <p className="text-sm text-muted-foreground">{t('convertedAt')}</p>
                <p className="font-medium">{formatDate(lead.convertedAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('editTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={t('leadTitle')}
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
              <Input
                label={t('firstName')}
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              <Input
                label={t('lastName')}
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
              <Input
                label={t('email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                label={t('phone')}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                label={t('companyName')}
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('status')}</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={LeadStatus.New}>{t('statuses.new')}</option>
                  <option value={LeadStatus.Contacted}>{t('statuses.contacted')}</option>
                  <option value={LeadStatus.Qualified}>{t('statuses.qualified')}</option>
                  <option value={LeadStatus.Unqualified}>{t('statuses.unqualified')}</option>
                  <option value={LeadStatus.Lost}>{t('statuses.lost')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('rating')}</label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={LeadRating.Cold}>{t('ratings.cold')}</option>
                  <option value={LeadRating.Warm}>{t('ratings.warm')}</option>
                  <option value={LeadRating.Hot}>{t('ratings.hot')}</option>
                </select>
              </div>
              <Input
                label={t('score')}
                name="score"
                type="number"
                value={formData.score}
                onChange={handleChange}
              />
              <Input
                label={t('estimatedValue')}
                name="estimatedValue"
                type="number"
                value={formData.estimatedValue || ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('description')}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-4">
              <Link href="/leads">
                <Button type="button" variant="outline">
                  {tCommon('cancel')}
                </Button>
              </Link>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t('saving') : tCommon('save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
