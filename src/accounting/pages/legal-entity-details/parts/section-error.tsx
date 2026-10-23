import { Alert, AlertDescription } from '@/shared/components/alert';
import { useTranslation } from 'react-i18next';

export function SectionError() {
  const { t } = useTranslation('accounting');
  const error_text = t('details_load_error');

  return (
    <Alert variant="destructive">
      <AlertDescription>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{error_text}</span>
        </div>
      </AlertDescription>
    </Alert>
  );
}
