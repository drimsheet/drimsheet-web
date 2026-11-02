import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { useTranslation } from 'react-i18next';

export function CategoryDetailsError() {
  const { t } = useTranslation('ledger-accounts');
  const error_title = t('category_details_error_title');
  const error_description = t('details_load_error_text');

  return (
    <Alert variant="destructive">
      <AlertTitle>{error_title}</AlertTitle>
      <AlertDescription>{error_description}</AlertDescription>
    </Alert>
  );
}
