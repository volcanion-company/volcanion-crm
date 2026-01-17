'use client';

import { Card } from '@/components/ui/Card';

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workflows</h1>
        <p className="text-muted-foreground">Automate your business processes</p>
      </div>

      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Workflow automation module</p>
      </Card>
    </div>
  );
}
