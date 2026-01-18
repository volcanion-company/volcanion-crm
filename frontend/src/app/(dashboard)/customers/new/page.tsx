'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCreateCustomer } from '@/hooks/useCustomers';
import { CustomerType, CustomerStatus, CustomerSource, CreateCustomerRequest } from '@/types';
import { useTranslations } from 'next-intl';

export default function NewCustomerPage() {
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const createCustomer = useCreateCustomer();

  const [formData, setFormData] = useState<CreateCustomerRequest>({
    name: '',
    type: CustomerType.Individual,
    email: '',
    phone: '',
    status: CustomerStatus.Prospect,
    source: CustomerSource.Direct,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer.mutate(formData, {
      onSuccess: () => {
        router.push('/customers');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tCommon('back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('create.title')}</h1>
          <p className="text-muted-foreground">{t('create.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('sections.basic')}</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fields.type')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: Number(e.target.value) as CustomerType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value={CustomerType.Individual}>{t('type.Individual')}</option>
                    <option value={CustomerType.Business}>{t('type.Business')}</option>
                  </select>
                </div>

                {/* Customer Code */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fields.customerCode')}
                  </label>
                  <Input
                    value={formData.customerCode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerCode: e.target.value }))}
                    placeholder={t('placeholders.customerCode')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fields.status')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: Number(e.target.value) as CustomerStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value={CustomerStatus.Prospect}>{t('status.Prospect')}</option>
                    <option value={CustomerStatus.Active}>{t('status.Active')}</option>
                    <option value={CustomerStatus.Inactive}>{t('status.Inactive')}</option>
                    <option value={CustomerStatus.Churned}>{t('status.Churned')}</option>
                  </select>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fields.source')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: Number(e.target.value) as CustomerSource }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value={CustomerSource.Direct}>{t('source.Direct')}</option>
                    <option value={CustomerSource.Referral}>{t('source.Referral')}</option>
                    <option value={CustomerSource.Website}>{t('source.Website')}</option>
                    <option value={CustomerSource.SocialMedia}>{t('source.SocialMedia')}</option>
                    <option value={CustomerSource.Advertisement}>{t('source.Advertisement')}</option>
                    <option value={CustomerSource.TradeShow}>{t('source.TradeShow')}</option>
                    <option value={CustomerSource.Partner}>{t('source.Partner')}</option>
                    <option value={CustomerSource.Other}>{t('source.Other')}</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Individual Information */}
          {formData.type === CustomerType.Individual && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('sections.individual')}</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('fields.fullName')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t('placeholders.fullName')}
                      required
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('fields.title')}
                    </label>
                    <Input
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('placeholders.title')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('fields.firstName')}
                    </label>
                    <Input
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder={t('placeholders.firstName')}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('fields.lastName')}
                    </label>
                    <Input
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder={t('placeholders.lastName')}
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fields.dateOfBirth')}
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Business Information */}
          {formData.type === CustomerType.Business && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('sections.business')}</h2>
              <div className="space-y-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fields.companyName')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('placeholders.companyName')}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tax ID */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('fields.taxId')}
                    </label>
                    <Input
                      value={formData.taxId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                      placeholder={t('placeholders.taxId')}
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('fields.industry')}
                    </label>
                    <Input
                      value={formData.industry || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder={t('placeholders.industry')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Employee Count */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('fields.employeeCount')}
                    </label>
                    <Input
                      type="number"
                      value={formData.employeeCount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeCount: Number(e.target.value) || undefined }))}
                      placeholder={t('placeholders.employeeCount')}
                    />
                  </div>

                  {/* Annual Revenue */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('fields.annualRevenue')}
                    </label>
                    <Input
                      type="number"
                      value={formData.annualRevenue || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, annualRevenue: Number(e.target.value) || undefined }))}
                      placeholder={t('placeholders.annualRevenue')}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Contact Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('sections.contact')}</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fields.email')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t('placeholders.email')}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fields.phone')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={t('placeholders.phone')}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fields.mobile')}
                  </label>
                  <Input
                    value={formData.mobile || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    placeholder={t('placeholders.mobile')}
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fields.website')}
                  </label>
                  <Input
                    value={formData.website || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder={t('placeholders.website')}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Address Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('sections.address')}</h2>
            <div className="space-y-6">
              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('fields.addressLine1')}
                </label>
                <Input
                  value={formData.addressLine1 || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                  placeholder={t('placeholders.addressLine1')}
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('fields.addressLine2')}
                </label>
                <Input
                  value={formData.addressLine2 || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
                  placeholder={t('placeholders.addressLine2')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fields.city')}
                  </label>
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder={t('placeholders.city')}
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fields.state')}
                  </label>
                  <Input
                    value={formData.state || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder={t('placeholders.state')}
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('fields.postalCode')}
                  </label>
                  <Input
                    value={formData.postalCode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder={t('placeholders.postalCode')}
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('fields.country')}
                </label>
                <Input
                  value={formData.country || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder={t('placeholders.country')}
                />
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('sections.additional')}</h2>
            <div className="space-y-6">
              {/* Assigned To User ID */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('fields.assignedTo')}
                </label>
                <Input
                  value={formData.assignedToUserId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedToUserId: e.target.value }))}
                  placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nhập User ID (Guid format). Để trống nếu chưa assign.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('fields.notes')}
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('placeholders.notes')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createCustomer.isPending || !formData.name || !formData.email || !formData.phone}
              >
                {createCustomer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('actions.create')}
              </Button>
              <Link href="/customers">
                <Button type="button" variant="outline">
                  {tCommon('cancel')}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}