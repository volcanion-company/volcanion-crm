'use client';

import { useState, useEffect, use } from 'react';
import { useLead, useUpdateLead } from '@/hooks/useLeads';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LeadSource, UpdateLeadRequest } from '@/types';
import { useTranslations } from 'next-intl';

export default function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const t = useTranslations('leads');
  const tCommon = useTranslations('common');
  
  const { data: lead, isLoading } = useLead(resolvedParams.id);
  const updateMutation = useUpdateLead();

  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    companyName: '',
    jobTitle: '',
    industry: '',
    employeeCount: undefined as number | undefined,
    addressLine1: '',
    city: '',
    state: '',
    country: '',
    source: LeadSource.Website,
    sourceDetail: '',
    estimatedValue: undefined as number | undefined,
    description: '',
    assignedToUserId: '',
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        title: lead.title || '',
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        mobile: lead.mobile || '',
        companyName: lead.companyName || '',
        jobTitle: lead.jobTitle || '',
        industry: lead.industry || '',
        employeeCount: lead.employeeCount,
        addressLine1: lead.addressLine1 || '',
        city: lead.city || '',
        state: lead.state || '',
        country: lead.country || '',
        source: lead.source ?? LeadSource.Website,
        sourceDetail: lead.sourceDetail || '',
        estimatedValue: lead.estimatedValue,
        description: lead.description || '',
        assignedToUserId: lead.assignedToUserId || '',
      });
    }
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only send fields that API allows for update
    const updateData: UpdateLeadRequest = {
      title: formData.title,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      companyName: formData.companyName,
      estimatedValue: formData.estimatedValue,
      description: formData.description,
    };
    
    await updateMutation.mutateAsync({ id: resolvedParams.id, data: updateData });
    router.push(`/leads/${resolvedParams.id}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'employeeCount' || name === 'estimatedValue' || name === 'source'
        ? value ? Number(value) : undefined
        : value,
    }));
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
        <Link href={`/leads/${resolvedParams.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tCommon('back')}
          </Button>
        </Link>
        <h1 className="mt-2 text-3xl font-bold">{t('editLead')}</h1>
        <p className="text-muted-foreground">{t('editExistingLead')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lead Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('leadInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  label={`${t('leadTitle')} *`}
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder={t('placeholders.title')}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('source')} *</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
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
              <Input
                label={t('sourceDetail')}
                name="sourceDetail"
                value={formData.sourceDetail}
                onChange={handleChange}
                placeholder={t('placeholders.sourceDetail')}
              />
              <Input
                label={t('estimatedValue')}
                name="estimatedValue"
                type="number"
                value={formData.estimatedValue || ''}
                onChange={handleChange}
                placeholder={t('placeholders.estimatedValue')}
              />
              <Input
                label={t('assignedTo')}
                name="assignedToUserId"
                value={formData.assignedToUserId}
                onChange={handleChange}
                placeholder="User ID"
              />
              <div className="md:col-span-2">
                <label className="text-sm font-medium">{t('description')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder={t('placeholders.description')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('contactInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={t('firstName')}
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t('placeholders.firstName')}
              />
              <Input
                label={t('lastName')}
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t('placeholders.lastName')}
              />
              <Input
                label={t('email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('placeholders.email')}
              />
              <Input
                label={t('phone')}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('placeholders.phone')}
              />
              <Input
                label={t('mobile')}
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder={t('placeholders.phone')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('companyInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={t('companyName')}
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder={t('placeholders.companyName')}
              />
              <Input
                label={t('jobTitle')}
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder={t('placeholders.jobTitle')}
              />
              <Input
                label={t('industry')}
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder={t('placeholders.industry')}
              />
              <Input
                label={t('employeeCount')}
                name="employeeCount"
                type="number"
                value={formData.employeeCount || ''}
                onChange={handleChange}
                placeholder="100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('addressInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  label={t('addressLine1')}
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                />
              </div>
              <Input
                label={t('city')}
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
              />
              <Input
                label={t('state')}
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="NY"
              />
              <Input
                label={t('country')}
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="USA"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/leads/${resolvedParams.id}`}>
            <Button type="button" variant="outline">
              {tCommon('cancel')}
            </Button>
          </Link>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? tCommon('saving') : tCommon('save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
