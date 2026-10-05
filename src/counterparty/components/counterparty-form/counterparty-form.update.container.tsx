import { useCounterparty } from '@/counterparty/hooks/use-counterparty';
import { useCounterpartyFormUpdate } from '@/counterparty/hooks/use-counterparty-form-update';
import { useCounterpartyTransactionUsage } from '@/counterparty/hooks/use-counterparty-transaction-usage';
import { counterpartyUpdateMapper } from '@/counterparty/lib/mappers/counterparty-update.mapper';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CounterpartyForm } from './counterparty-form';
import type {
  CounterpartyFormUpdateContainerProps,
  ICounterpartyFormValues,
} from './types';

export function CounterpartyFormUpdateContainer({
  counterpartyId,
  onSuccess,
  onCancel,
  onBusyChange,
  onLoaded,
  loadingFallback,
}: Readonly<CounterpartyFormUpdateContainerProps>) {
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

  const handleSubmit = (values: ICounterpartyFormValues) => {
    if (!baseline || state.saving) return;

    void state.handleUpdate(
      counterpartyUpdateMapper.toCounterpartyUpdateReq(
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

  if (!baseline) return loadingFallback;

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
    <CounterpartyForm
      key={baseline.id}
      initialValues={counterpartyUpdateMapper.toCounterpartyValues(baseline)}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitLabel={save_label}
      loading={state.saving}
      disabled={baseline.status === 'archived'}
      typeRestriction={typeRestriction}
    />
  );
}
