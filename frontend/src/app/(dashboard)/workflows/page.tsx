'use client';

import { Card } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';

export default function WorkflowsPage() {
  const t = useTranslations('workflows');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{t('comingSoon')}</p>
      </Card>
    </div>
  );
}
