import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { PageSection } from '@/shared/components/page-section';
import { useTranslation } from 'react-i18next';
import type { ProfileSectionStateProps } from '../types';

export function ProfileSectionState({
  label,
}: Readonly<ProfileSectionStateProps>) {
  const { t } = useTranslation('user');
  const error_text = t('profile_section_error_text', { section: label });

  return (
    <PageSection>
      <Alert variant="destructive" className="self-start">
        <AlertTitle>{label}</AlertTitle>
        <AlertDescription>{error_text}</AlertDescription>
      </Alert>
    </PageSection>
  );
}
