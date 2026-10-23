import { AppBody } from '@/shared/components/app';
import { useTranslation } from 'react-i18next';

export function LegalEntityPage() {
  const { t } = useTranslation('accounting');

  const placeholder_text = t('legal_entity_placeholder_text');

  return <AppBody>{placeholder_text}</AppBody>;
}
