'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSalesPipelineReport, useLeadConversionReport } from '@/hooks/useReports';
import { Loading } from '@/components/ui/Loading';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Users, TrendingUp, Ticket, DollarSign } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function DashboardPage() {
  const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: salesData, isLoading: salesLoading } = useSalesPipelineReport({
    startDate,
    endDate,
  });

  const { data: leadData, isLoading: leadLoading } = useLeadConversionReport({
    startDate,
    endDate,
  });

  if (salesLoading || leadLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  const stats = [
    {
      name: 'Total Pipeline Value',
      value: formatCurrency(salesData?.totalValue || 0),
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      name: 'Active Deals',
      value: salesData?.totalDeals || 0,
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      name: 'Total Leads',
      value: leadData?.totalLeads || 0,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      name: 'Conversion Rate',
      value: formatPercent(leadData?.conversionRate || 0),
      icon: Ticket,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Win Rate</span>
                <span className="text-sm">{formatPercent(salesData?.winRate || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Deal Size</span>
                <span className="text-sm">{formatCurrency(salesData?.averageDealSize || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Forecasted Revenue</span>
                <span className="text-sm">{formatCurrency(salesData?.forecastedRevenue || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadData?.conversionFunnel?.map((stage) => (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{stage.stage}</span>
                    <span className="font-medium">{stage.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${stage.conversionRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
