import { Alert, AlertDescription } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import { useTranslation } from 'react-i18next';
import type { SectionErrorProps } from '../types';

export function SectionError({
  onRetry,
  pending,
}: Readonly<SectionErrorProps>) {
  const { t } = useTranslation('accounting');
  const error_text = t('details_load_error');
  const retry_label = t('legal_entities_retry_label');

  return (
    <Alert variant="destructive">
      <AlertDescription>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{error_text}</span>
          <Button variant="ghost" disabled={pending} onClick={onRetry}>
            {retry_label}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
