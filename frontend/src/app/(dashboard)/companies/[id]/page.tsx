'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CompanyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/companies">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Customer Details</h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>
      </div>

      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p>Customer details coming soon...</p>
          <p className="mt-2 text-sm">This feature is under development</p>
        </div>
      </Card>
    </div>
  );
}
