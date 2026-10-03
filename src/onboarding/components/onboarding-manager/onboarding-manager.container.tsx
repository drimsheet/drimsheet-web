import { AccountingEntityCreationDialog } from '@/accounting/dialogs/accounting-entity-creation';
import { useAccountingEntities } from '@/accounting/hooks/use-accounting-entities';
import { useTranslation } from 'react-i18next';

export function OnboardingManagerContainer() {
  const { t } = useTranslation('accounting');
  const {
    data: accountingEntities,
    isLoading: isLoadingEntities,
    refetch,
  } = useAccountingEntities();

  const openAccountingOnboardingForm = accountingEntities?.length === 0;

  const handleDone = async () => {
    const result = await refetch();
    if (result.error) throw result.error;

    if (!result.data?.length) {
      throw new Error(t('onboarding_entity_refresh_error'));
    }
  };

  if (isLoadingEntities) return null;

  return (
    <AccountingEntityCreationDialog
      initialOnboarding
      open={openAccountingOnboardingForm}
      done={handleDone}
    />
  );
}
