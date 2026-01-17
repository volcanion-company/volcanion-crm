'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  useSalesPipelineReport, 
  useLeadConversionReport, 
  useTicketAnalyticsReport 
} from '@/hooks/useReports';
import { Loading } from '@/components/ui/Loading';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { format, subDays } from 'date-fns';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: salesData, isLoading: salesLoading } = useSalesPipelineReport({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Analyze your business performance</p>
      </div>

      <Card className="p-4">
        <div className="flex gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
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
              <CardTitle>Sales Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Value</span>
                <span className="font-semibold">{formatCurrency(salesData?.totalValue || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Deals</span>
                <span className="font-semibold">{salesData?.totalDeals || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Win Rate</span>
                <span className="font-semibold">{formatPercent(salesData?.winRate || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Deal Size</span>
                <span className="font-semibold">{formatCurrency(salesData?.averageDealSize || 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lead Conversion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Leads</span>
                <span className="font-semibold">{leadData?.totalLeads || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Converted</span>
                <span className="font-semibold">{leadData?.convertedLeads || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Conversion Rate</span>
                <span className="font-semibold">{formatPercent(leadData?.conversionRate || 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Tickets</span>
                <span className="font-semibold">{ticketData?.totalTickets || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Open Tickets</span>
                <span className="font-semibold">{ticketData?.openTickets || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Resolution Time</span>
                <span className="font-semibold">{ticketData?.averageResolutionTime?.toFixed(1) || 0}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">SLA Compliance</span>
                <span className="font-semibold">{formatPercent(ticketData?.slaCompliance || 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
