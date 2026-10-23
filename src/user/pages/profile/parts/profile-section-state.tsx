import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { PageSection } from '@/shared/components/page-section';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import type { ProfileSectionStateProps } from '../types';

export function ProfileSectionState({
  isLoading,
  label,
}: Readonly<ProfileSectionStateProps>) {
  const { t } = useTranslation('user');
  const loading_text = t('profile_section_loading_text', { section: label });
  const error_text = t('profile_section_error_text', { section: label });

  if (isLoading) {
    return (
      <PageSection className="min-h-64 gap-5">
        <output className="sr-only" aria-label={loading_text}>
          {loading_text}
        </output>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </PageSection>
    );
  }

  return (
    <PageSection>
      <Alert variant="destructive" className="self-start">
        <AlertTitle>{label}</AlertTitle>
        <AlertDescription>{error_text}</AlertDescription>
      </Alert>
    </PageSection>
  );
}
