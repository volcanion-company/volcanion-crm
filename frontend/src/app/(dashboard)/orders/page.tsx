'use client';

import { useState } from 'react';
import { useOrders, useDeleteOrder, useConfirmOrder, useOrderStats } from '@/hooks/useOrders';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Loading } from '@/components/ui/Loading';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  CheckCircle,
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { OrderStatus, PaymentStatus } from '@/types';
import Link from 'next/link';

const orderStatusColors: Record<OrderStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [OrderStatus.Draft]: 'default',
  [OrderStatus.Confirmed]: 'info',
  [OrderStatus.Processing]: 'warning',
  [OrderStatus.Shipped]: 'info',
  [OrderStatus.Delivered]: 'success',
  [OrderStatus.Completed]: 'success',
  [OrderStatus.Cancelled]: 'danger',
  [OrderStatus.Refunded]: 'danger',
};

const paymentStatusColors: Record<PaymentStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  [PaymentStatus.Unpaid]: 'danger',
  [PaymentStatus.PartiallyPaid]: 'warning',
  [PaymentStatus.Paid]: 'success',
  [PaymentStatus.Refunded]: 'default',
};

export default function OrdersPage() {
  const t = useTranslations('orders');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useOrders({ page, pageSize: 20 });
  const { data: stats } = useOrderStats();
  const deleteMutation = useDeleteOrder();
  const confirmMutation = useConfirmOrder();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleConfirm = async (id: string) => {
    if (!confirm('Confirm this order?')) return;
    try {
      await confirmMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.paidAmount)}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unpaid Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.unpaidAmount)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and payments</p>
        </div>
        <Link href="/orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <Link href={`/orders/${order.id}`} className="hover:underline">
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>{order.customerName || '-'}</TableCell>
                <TableCell>
                  <Badge variant={orderStatusColors[order.status]}>
                    {OrderStatus[order.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={paymentStatusColors[order.paymentStatus]}>
                    {PaymentStatus[order.paymentStatus]}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>{formatCurrency(order.paidAmount)}</TableCell>
                <TableCell className={order.balanceAmount > 0 ? 'text-red-600' : ''}>
                  {formatCurrency(order.balanceAmount)}
                </TableCell>
                <TableCell>{formatDate(order.orderDate)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {order.status === OrderStatus.Draft && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirm(order.id)}
                        disabled={confirmMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(order.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data && (
          <div className="p-4">
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              totalCount={data.totalCount}
              totalPages={data.totalPages}
              hasNextPage={data.hasNextPage}
              hasPreviousPage={data.hasPreviousPage}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
