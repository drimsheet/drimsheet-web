import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { useTranslation } from 'react-i18next';
import type { SectionErrorProps } from '../types';

export function SectionError({ title }: Readonly<SectionErrorProps>) {
  const { t } = useTranslation('ledger-accounts');
  const error_text = t('details_load_error_text');

  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{error_text}</AlertDescription>
    </Alert>
  );
}
