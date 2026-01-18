'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useDashboardReport, useLeadConversionReport, useSalesPerformanceReport } from '@/hooks/useReports';
// import { useCustomerStats } from '@/hooks/useCustomers'; // Hook not implemented yet
// import { usePipelineStats } from '@/hooks/useOpportunities'; // Hook not implemented yet
// import { useOrderStats } from '@/hooks/useOrders'; // Hook not implemented yet
// import { useContractStats } from '@/hooks/useContracts'; // Hook not implemented yet
import { useTranslations } from 'next-intl';
import { Loading } from '@/components/ui/Loading';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  Users,
  TrendingUp,
  Ticket,
  DollarSign,
  ShoppingCart,
  FileCheck,
  Building2,
  Target,
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardReport();
  // const { data: customerStats } = useCustomerStats();
  // const { data: pipelineStats } = usePipelineStats();
  // const { data: orderStats } = useOrderStats();
  // const { data: contractStats } = useContractStats();
  
  const { data: salesData, isLoading: salesLoading } = useSalesPerformanceReport({
    startDate,
    endDate,
  });

  const { data: leadData, isLoading: leadLoading } = useLeadConversionReport({
    startDate,
    endDate,
  });

  if (dashboardLoading || salesLoading || leadLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  const mainStats = [
    {
      name: 'Total Revenue',
      value: formatCurrency(dashboardData?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Active Customers',
      value: dashboardData?.totalLeads || 0,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Pipeline Value',
      value: formatCurrency(dashboardData?.totalRevenue || 0),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Active Contracts',
      value: 0,
      icon: FileCheck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const secondaryStats = [
    {
      name: 'Total Orders',
      value: 0,
      change: '+12%',
      icon: ShoppingCart,
    },
    {
      name: 'Unpaid Orders',
      value: formatCurrency(0),
      change: null,
      icon: ShoppingCart,
    },
    {
      name: 'Win Rate',
      value: '0%',
      change: '+5%',
      icon: TrendingUp,
    },
    {
      name: 'Avg Deal Size',
      value: formatCurrency(0),
      change: null,
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('welcome')}</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {secondaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
                {stat.change && (
                  <p className="mt-2 text-xs text-green-600">{stat.change} from last month</p>
                )}
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
              <p className="text-sm text-muted-foreground">No pipeline data available yet</p>
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
