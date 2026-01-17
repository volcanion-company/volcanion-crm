'use client';

import { Card } from '@/components/ui/Card';

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="text-muted-foreground">Create and manage marketing campaigns</p>
      </div>

      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Marketing campaign module</p>
      </Card>
    </div>
  );
}
