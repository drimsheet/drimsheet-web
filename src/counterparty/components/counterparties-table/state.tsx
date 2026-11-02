import { Alert, AlertDescription } from '@/shared/components/alert';
import { useTranslation } from 'react-i18next';

export function CounterpartiesTableError() {
  const { t } = useTranslation('counterparty');
  const error_text = t('table_load_error_text');

  return (
    <Alert variant="destructive">
      <AlertDescription>{error_text}</AlertDescription>
    </Alert>
  );
}
