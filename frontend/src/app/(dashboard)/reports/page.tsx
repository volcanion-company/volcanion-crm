'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  useSalesPerformanceReport, 
  useLeadConversionReport, 
  useTicketAnalyticsReport 
} from '@/hooks/useReports';
import { Loading } from '@/components/ui/Loading';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { useTranslations } from 'next-intl';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: salesData, isLoading: salesLoading } = useSalesPerformanceReport({
    startDate,
    endDate,
  });

  const { data: leadData, isLoading: leadLoading } = useLeadConversionReport({
    startDate,
    endDate,
  });

  const { data: ticketData, isLoading: ticketLoading } = useTicketAnalyticsReport({
    startDate,
    endDate,
  });

  const isLoading = salesLoading || leadLoading || ticketLoading;

  const t = useTranslations('reports');
  const tCommon = useTranslations('common');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Card className="p-4">
        <div className="flex gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('startDate')}</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('endDate')}</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Loading size="lg" className="h-96" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t('salesPerformance')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{t('totalRevenue')}</span>
                <span className="font-semibold">{formatCurrency(salesData?.totalRevenue || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('dealsWon')}</span>
                <span className="font-semibold">{salesData?.dealsWon || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('dealsLost')}</span>
                <span className="font-semibold">{salesData?.dealsLost || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('avgDealSize')}</span>
                <span className="font-semibold">{formatCurrency(salesData?.averageDealSize || 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('leadConversion')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{t('totalLeads')}</span>
                <span className="font-semibold">{leadData?.totalLeads || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('converted')}</span>
                <span className="font-semibold">{leadData?.convertedLeads || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('conversionRate')}</span>
                <span className="font-semibold">{formatPercent(leadData?.conversionRate || 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('supportTickets')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{t('totalTickets')}</span>
                <span className="font-semibold">{ticketData?.totalTickets || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('openTickets')}</span>
                <span className="font-semibold">{ticketData?.openTickets || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('avgResolutionTime')}</span>
                <span className="font-semibold">{ticketData?.averageResolutionTime?.toFixed(1) || 0}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('slaCompliance')}</span>
                <span className="font-semibold">{formatPercent(ticketData?.slaCompliance || 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
