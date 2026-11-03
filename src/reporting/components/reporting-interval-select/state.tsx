import { FieldError } from '@/shared/components/field';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function ReportingIntervalSelectSkeleton() {
  const { t } = useTranslation('shared');
  const loading_label = t('interval_select_loading_label');

  return (
    <div aria-busy="true">
      <output className="sr-only">{loading_label}</output>
      <Skeleton className="h-9 w-48" />
    </div>
  );
}

export function ReportingIntervalSelectError() {
  const { t } = useTranslation('reporting');
  const error_text = t('interval_select_load_error');

  return <FieldError>{error_text}</FieldError>;
}
