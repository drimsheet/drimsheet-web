import { AppBody } from '@/shared/components/app';
import { useTranslation } from 'react-i18next';

export function LegalEntityDetailsPage() {
  const { t } = useTranslation('accounting');
  const placeholder_text = t('legal_entity_details_placeholder_text');

  return <AppBody>{placeholder_text}</AppBody>;
}
