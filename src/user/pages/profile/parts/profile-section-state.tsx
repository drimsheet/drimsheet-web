import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import type { ProfileSectionStateProps } from '../types';

export function ProfileSectionState({
  isLoading,
  label,
  onRetry,
}: Readonly<ProfileSectionStateProps>) {
  const { t } = useTranslation('user');
  const loading_text = t('profile_section_loading_text', { section: label });
  const error_text = t('profile_section_error_text', { section: label });
  const retry_label = t('profile_retry_label');

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label={loading_text}
        className="flex min-h-64 flex-col gap-5 rounded-xl p-6"
      >
        <span className="sr-only">{loading_text}</span>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return (
    <Alert variant="destructive" className="self-start">
      <AlertTitle>{label}</AlertTitle>
      <AlertDescription>
        {error_text}
        <Button variant="outline" onClick={onRetry}>
          {retry_label}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
