import { useCounterparty } from '@/counterparty/hooks/use-counterparty';
import { useCounterpartyFormUpdate } from '@/counterparty/hooks/use-counterparty-form-update';
import { useCounterpartyTransactionUsage } from '@/counterparty/hooks/use-counterparty-transaction-usage';
import { counterpartyUpdateMapper } from '@/counterparty/lib/mappers/counterparty-update.mapper';
import { useJurisdictions } from '@/shared/hooks/use-jurisdictions';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ContractorForm } from './contractor-form';
import type {
  ContractorFormUpdateContainerProps,
  IContractorFormValues,
} from './types';

export function ContractorFormUpdateContainer({
  counterpartyId,
  onSuccess,
  onCancel,
  onBusyChange,
  onLoaded,
  loadingFallback,
}: Readonly<ContractorFormUpdateContainerProps>) {
  const { t } = useTranslation('counterparty');
  const read = useCounterparty(counterpartyId, { scope: 'update' });

  const state = useCounterpartyFormUpdate({
    counterpartyId,
    counterparty: read.data,
    ready:
      read.isFetchedAfterMount && !read.isFetching && !read.isPlaceholderData,
    onSuccess,
  });

  const baseline = state.baseline;
  const usage = useCounterpartyTransactionUsage(baseline?.id);

  const jurisdictions = useJurisdictions({
    enabled: Boolean(baseline),
    scope: 'dialog',
  });

  const handleSubmit = (values: IContractorFormValues) => {
    if (!baseline || state.saving) return;

    void state.handleUpdate(
      counterpartyUpdateMapper.toContractorUpdateReq(
        values,
        baseline,
        usage.canChangeType
      )
    );
  };

  useEffect(() => {
    onBusyChange?.(state.saving);

    return () => onBusyChange?.(false);
  }, [state.saving, onBusyChange]);

  useEffect(() => {
    if (baseline) onLoaded?.(baseline);
  }, [baseline, onLoaded]);

  if (!baseline || jurisdictions.isPending) return loadingFallback;

  const typeRestriction = !usage.canChangeType
    ? {
        value: baseline.type,
        description: t(
          usage.used ? 'type_locked_description' : 'type_usage_checking_text'
        ),
      }
    : undefined;

  const save_label = t('save_changes_label');

  return (
    <ContractorForm
      key={baseline.id}
      initialValues={counterpartyUpdateMapper.toContractorValues(baseline)}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitLabel={save_label}
      loading={state.saving}
      disabled={baseline.status === 'archived'}
      typeRestriction={typeRestriction}
      jurisdictions={jurisdictions.data ?? []}
      showPostalCode
      showDisplayName={false}
    />
  );
}
