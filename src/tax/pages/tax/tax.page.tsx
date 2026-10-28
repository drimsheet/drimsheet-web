import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { useTranslation } from 'react-i18next';

export function TaxPage() {
  const { t } = useTranslation('shared');

  const tax_title = t('tax');
  const placeholder_text = t('placeholder_text');

  return (
    <AppBody title={tax_title}>
      <AppSection>
        <p>{placeholder_text}</p>
      </AppSection>
    </AppBody>
  );
}
