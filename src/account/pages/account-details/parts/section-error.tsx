import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import { useTranslation } from 'react-i18next';
import type { SectionErrorProps } from '../types';

export function SectionError({ title, onRetry }: Readonly<SectionErrorProps>) {
  const { t } = useTranslation('ledger-accounts');
  const error_text = t('details_load_error_text');
  const retry_label = t('details_retry_label');

  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {error_text}
        <Button variant="ghost" onClick={onRetry}>
          {retry_label}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
