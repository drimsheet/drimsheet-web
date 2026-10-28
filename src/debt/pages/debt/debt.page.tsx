import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { useTranslation } from 'react-i18next';

export function DebtPage() {
  const { t } = useTranslation(['navigation', 'shared']);

  const debt_title = t('navigation:debt');
  const placeholder_text = t('shared:placeholder_text');

  return (
    <AppBody title={debt_title}>
      <AppSection>
        <p>{placeholder_text}</p>
      </AppSection>
    </AppBody>
  );
}
