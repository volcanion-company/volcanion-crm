'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewQuotationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/quotations">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Quotation</h1>
          <p className="text-muted-foreground">Create a new sales quotation</p>
        </div>
      </div>

      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p>Quotation form coming soon...</p>
          <p className="mt-2 text-sm">This feature is under development</p>
        </div>
      </Card>
    </div>
  );
}
