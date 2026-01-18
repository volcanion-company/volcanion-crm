'use client';

import { useState } from 'react';
import { useActivities, useDeleteActivity, useCompleteActivity } from '@/hooks/useActivities';
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
  Calendar,
  Clock,
  Phone,
  Mail,
  Users,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ActivityType, ActivityStatus, ActivityPriority } from '@/types';
import Link from 'next/link';

const typeColors: Record<ActivityType, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [ActivityType.Call]: 'info',
  [ActivityType.Email]: 'default',
  [ActivityType.Meeting]: 'success',
  [ActivityType.Task]: 'warning',
  [ActivityType.Deadline]: 'danger',
  [ActivityType.Note]: 'default',
};

const typeIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  [ActivityType.Call]: Phone,
  [ActivityType.Email]: Mail,
  [ActivityType.Meeting]: Users,
  [ActivityType.Task]: CheckCircle,
  [ActivityType.Deadline]: Clock,
  [ActivityType.Note]: Edit,
};

const statusColors: Record<ActivityStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  [ActivityStatus.Planned]: 'warning',
  [ActivityStatus.InProgress]: 'info',
  [ActivityStatus.Completed]: 'success',
  [ActivityStatus.Cancelled]: 'danger',
};

const priorityColors: Record<ActivityPriority, 'default' | 'success' | 'warning' | 'danger'> = {
  [ActivityPriority.Low]: 'default',
  [ActivityPriority.Medium]: 'warning',
  [ActivityPriority.High]: 'danger',
};

export default function ActivitiesPage() {
  const t = useTranslations('activities');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useActivities({ page, pageSize: 20 });
  const deleteMutation = useDeleteActivity();
  const completeMutation = useCompleteActivity();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">Track calls, meetings, tasks and notes</p>
        </div>
        <Link href="/activities/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Activity
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
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
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Related To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((activity) => {
              const TypeIcon = typeIcons[activity.type];
              return (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4" />
                      <Badge variant={typeColors[activity.type]}>
                        {ActivityType[activity.type]}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/activities/${activity.id}`} className="hover:underline">
                      {activity.subject}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {activity.relatedToType ? (
                      <span className="text-sm text-muted-foreground">
                        {activity.relatedToType}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[activity.status]}>
                      {ActivityStatus[activity.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityColors[activity.priority]}>
                      {ActivityPriority[activity.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {activity.dueDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span
                          className={
                            new Date(activity.dueDate) < new Date() &&
                            activity.status !== ActivityStatus.Completed
                              ? 'text-red-600'
                              : ''
                          }
                        >
                          {formatDate(activity.dueDate)}
                        </span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{activity.assignedToName || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {activity.status !== ActivityStatus.Completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleComplete(activity.id)}
                          disabled={completeMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Link href={`/activities/${activity.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(activity.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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

