import { FieldDescription } from '@/shared/components/field';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface IAuthConsentProps {
  actionText?: string;
}

export function AuthConsent({
  actionText = 'creating an account',
}: Readonly<IAuthConsentProps>) {
  const { t } = useTranslation(['auth']);

  const consent_text = t('auth:by_action_you_agree_to_our_text', {
    action: actionText,
  });

  const terms_of_service_text = t('terms_of_service_text');
  const and_text = t('and_text');
  const privacy_policy_text = t('privacy_policy_text');

  return (
    <FieldDescription className="px-6 text-center text-xs">
      {consent_text}{' '}
      <Link to="/terms-of-service" className="hover:text-link text-xs">
        {terms_of_service_text}
      </Link>{' '}
      {and_text}{' '}
      <Link to="/privacy-policy" className="hover:text-link text-xs">
        {privacy_policy_text}
      </Link>
      .
    </FieldDescription>
  );
}
