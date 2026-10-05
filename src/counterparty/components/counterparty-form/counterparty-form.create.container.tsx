import { useCreateCounterparty } from '@/counterparty/hooks/use-create-counterparty';
import { counterpartyMapper } from '@/counterparty/lib/mappers/counterparty.mapper';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CounterpartyForm } from './counterparty-form';
import type {
  CounterpartyFormCreateContainerProps,
  ICounterpartyFormValues,
} from './types';

export function CounterpartyFormCreateContainer({
  onSuccess,
  onBusyChange,
}: Readonly<CounterpartyFormCreateContainerProps>) {
  const { t } = useTranslation('counterparty');
  const handleApiError = useApiErrorHandler();

  const { mutateAsync: createCounterparty, isPending: isCreating } =
    useCreateCounterparty();

  useEffect(() => {
    onBusyChange?.(isCreating);

    return () => onBusyChange?.(false);
  }, [isCreating, onBusyChange]);

  const handleSubmit = async (values: ICounterpartyFormValues) => {
    if (isCreating) return;

    try {
      await createCounterparty(
        counterpartyMapper.toCounterpartyCreateReq(values)
      );
      toast.success(t('counterparty_created_success_text'));
      onSuccess();
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  return (
    <CounterpartyForm
      onSubmit={handleSubmit}
      loading={isCreating}
      disabled={isCreating}
    />
  );
}
