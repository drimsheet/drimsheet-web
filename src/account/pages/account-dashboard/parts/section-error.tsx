import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DashboardErrorProps } from '../types';

export function DashboardError({
  title,
  onRetry,
  pending = false,
}: Readonly<DashboardErrorProps>) {
  const { t } = useTranslation('ledger-accounts');
  const description = t('dashboard_error_description');
  const retry_label = t('dashboard_retry_label');

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <Alert variant="destructive">
        <TriangleAlert aria-hidden />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
      <Button variant="outline" onClick={onRetry} loading={pending}>
        <RefreshCw data-icon="inline-start" />
        {retry_label}
      </Button>
    </div>
  );
}
