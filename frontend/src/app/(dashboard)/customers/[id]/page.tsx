'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCustomer, useDeleteCustomer } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { 
  ArrowLeft, Building2, User, Mail, Phone, Globe, MapPin, Calendar, 
  DollarSign, Edit, Trash2, Loader2, Users, Smartphone, FileText,
  Briefcase, Hash, TrendingUp, Tag, UserCheck
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { CustomerStatus, CustomerType, CustomerSource } from '@/types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const statusColors: Record<CustomerStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [CustomerStatus.Prospect]: 'info',
  [CustomerStatus.Active]: 'success',
  [CustomerStatus.Inactive]: 'warning',
  [CustomerStatus.Churned]: 'danger',
};

export default function CustomerDetailPage() {
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: customer, isLoading, error } = useCustomer(id);
  const deleteCustomer = useDeleteCustomer();

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteCustomer.mutate(id, {
      onSuccess: () => {
        router.push('/customers');
      },
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{t('notFound')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tCommon('back')}
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              {customer.type === CustomerType.Business ? (
                <Building2 className="h-8 w-8 text-blue-500" />
              ) : (
                <User className="h-8 w-8 text-gray-500" />
              )}
              <h1 className="text-3xl font-bold">{customer.name}</h1>
              <Badge variant={statusColors[customer.status]}>
                {t(`status.${CustomerStatus[customer.status]}`)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {t(`type.${CustomerType[customer.type]}`)}
              {customer.customerCode && ` • ${customer.customerCode}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/customers/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              {tCommon('edit')}
            </Button>
          </Link>
          <Button variant="outline" onClick={handleDeleteClick}>
            <Trash2 className="mr-2 h-4 w-4" />
            {tCommon('delete')}
          </Button>
        </div>
      </div>

      {/* 360° View: 4 Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Customer Overview */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('sections.overview')}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {t('fields.status')}
                </p>
                <Badge variant={statusColors[customer.status]} className="mt-1">
                  {t(`status.${CustomerStatus[customer.status]}`)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {t('fields.source')}
                </p>
                <p className="font-medium">{customer.source !== undefined ? t(`source.${CustomerSource[customer.source]}`) : '-'}</p>
              </div>
            </div>

            {customer.lifetimeValue !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {t('fields.lifetimeValue')}
                </p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(customer.lifetimeValue)}
                </p>
              </div>
            )}

            {customer.customerCode && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {t('fields.customerCode')}
                </p>
                <p className="font-mono text-sm">{customer.customerCode}</p>
              </div>
            )}

            {(customer.assignedToUserId || customer.assignedToUserName) && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <UserCheck className="h-3 w-3" />
                  {t('fields.assignedTo')}
                </p>
                <p className="font-medium">{customer.assignedToUserName || customer.assignedToUserId}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t('fields.createdAt')}
              </p>
              <p className="text-sm">{formatDate(customer.createdAt)}</p>
            </div>
          </div>
        </Card>

        {/* Card 2: Contact Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('sections.contact')}
          </h2>
          <div className="space-y-4">
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('fields.email')}</p>
                  <a href={`mailto:${customer.email}`} className="hover:underline">
                    {customer.email}
                  </a>
                </div>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('fields.phone')}</p>
                  <a href={`tel:${customer.phone}`} className="hover:underline">
                    {customer.phone}
                  </a>
                </div>
              </div>
            )}

            {customer.mobile && (
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('fields.mobile')}</p>
                  <a href={`tel:${customer.mobile}`} className="hover:underline">
                    {customer.mobile}
                  </a>
                </div>
              </div>
            )}

            {customer.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('fields.website')}</p>
                  <a
                    href={customer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-600"
                  >
                    {customer.website}
                  </a>
                </div>
              </div>
            )}

            {customer.title && (
              <div>
                <p className="text-sm text-muted-foreground">{t('fields.title')}</p>
                <p className="font-medium">{customer.title}</p>
              </div>
            )}

            {customer.dateOfBirth && (
              <div>
                <p className="text-sm text-muted-foreground">{t('fields.dateOfBirth')}</p>
                <p className="font-medium">{formatDate(customer.dateOfBirth)}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Card 3: Business/Individual Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {customer.type === CustomerType.Business ? (
              <>
                <Briefcase className="h-5 w-5" />
                {t('sections.business')}
              </>
            ) : (
              <>
                <User className="h-5 w-5" />
                {t('sections.individual')}
              </>
            )}
          </h2>
          <div className="space-y-3">
            {customer.type === CustomerType.Business && (
              <>
                {customer.companyName && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('fields.companyName')}</p>
                    <p className="font-medium">{customer.companyName}</p>
                  </div>
                )}
                {customer.taxId && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('fields.taxId')}</p>
                    <p className="font-medium font-mono text-sm">{customer.taxId}</p>
                  </div>
                )}
                {customer.industry && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('fields.industry')}</p>
                    <p className="font-medium">{customer.industry}</p>
                  </div>
                )}
                {customer.employeeCount && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('fields.employeeCount')}</p>
                    <p className="font-medium">{customer.employeeCount.toLocaleString()}</p>
                  </div>
                )}
                {customer.annualRevenue && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('fields.annualRevenue')}</p>
                    <p className="font-medium">{formatCurrency(customer.annualRevenue)}</p>
                  </div>
                )}
              </>
            )}

            {customer.type === CustomerType.Individual && (
              <>
                {customer.firstName && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('fields.firstName')}</p>
                    <p className="font-medium">{customer.firstName}</p>
                  </div>
                )}
                {customer.lastName && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('fields.lastName')}</p>
                    <p className="font-medium">{customer.lastName}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Card 4: Address & Location */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('sections.address')}
          </h2>
          <div className="space-y-3">
            {customer.addressLine1 && (
              <div>
                <p className="text-sm text-muted-foreground">{t('fields.addressLine1')}</p>
                <p className="font-medium">{customer.addressLine1}</p>
              </div>
            )}

            {customer.addressLine2 && (
              <div>
                <p className="text-sm text-muted-foreground">{t('fields.addressLine2')}</p>
                <p className="font-medium">{customer.addressLine2}</p>
              </div>
            )}

            {(customer.city || customer.state || customer.postalCode) && (
              <div>
                <p className="text-sm text-muted-foreground">{t('fields.cityStatePostal')}</p>
                <p className="font-medium">
                  {[customer.city, customer.state, customer.postalCode].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {customer.country && (
              <div>
                <p className="text-sm text-muted-foreground">{t('fields.country')}</p>
                <p className="font-medium">{customer.country}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Contacts Array */}
      {customer.contacts && customer.contacts.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('sections.contacts')} ({customer.contacts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.contacts.map((contact, index) => (
              <div key={index} className="border rounded-lg p-4">
                <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                {contact.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {contact.email}
                  </p>
                )}
                {contact.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {contact.phone}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notes */}
      {customer.notes && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('fields.notes')}
          </h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('deleteDialog.title')}</h2>
            <p className="text-muted-foreground mb-6">{t('deleteDialog.message')}</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteCustomer.isPending}
              >
                {deleteCustomer.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon('deleting')}
                  </>
                ) : (
                  tCommon('delete')
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
