import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { AppSection } from '@/shared/components/app-section';
import { useTranslation } from 'react-i18next';
import type { ProfileSectionStateProps } from '../types';

export function ProfileSectionState({
  label,
}: Readonly<ProfileSectionStateProps>) {
  const { t } = useTranslation('user');
  const error_text = t('profile_section_error_text', { section: label });

  return (
    <AppSection>
      <Alert variant="destructive" className="self-start">
        <AlertTitle>{label}</AlertTitle>
        <AlertDescription>{error_text}</AlertDescription>
      </Alert>
    </AppSection>
  );
}
