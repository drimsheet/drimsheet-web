import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DashboardErrorProps } from '../types';

export function DashboardError({ title }: Readonly<DashboardErrorProps>) {
  const { t } = useTranslation('ledger-accounts');
  const description = t('dashboard_error_description');

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <Alert variant="destructive">
        <TriangleAlert aria-hidden />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
}
