import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import { useTranslation } from 'react-i18next';
import type { SectionErrorProps } from '../types';

export function CategoryDetailsError({ onRetry }: Readonly<SectionErrorProps>) {
  const { t } = useTranslation('ledger-accounts');
  const title = t('category_details_error_title');
  const description = t('details_load_error_text');
  const retry_label = t('details_retry_label');

  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
        <Button variant="ghost" onClick={onRetry}>
          {retry_label}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
