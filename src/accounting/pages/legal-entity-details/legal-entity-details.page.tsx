import { AppBody } from '@/shared/components/app';
import { PageSection } from '@/shared/components/page-section';
import { PageTitle } from '@/shared/components/page-title';
import { useTranslation } from 'react-i18next';

export function LegalEntityDetailsPage() {
  const { t } = useTranslation('accounting');
  const page_title = t('legal_entity_details_title');
  const placeholder_text = t('legal_entity_details_placeholder_text');

  return (
    <AppBody>
      <PageTitle>{page_title}</PageTitle>
      <PageSection>{placeholder_text}</PageSection>
    </AppBody>
  );
}
