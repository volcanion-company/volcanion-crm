'use client';

import { Card } from '@/components/ui/Card';

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activities</h1>
        <p className="text-muted-foreground">Track calls, emails, meetings, and tasks</p>
      </div>

      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Activity management module</p>
      </Card>
    </div>
  );
}
