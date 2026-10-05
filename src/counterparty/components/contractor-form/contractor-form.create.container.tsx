import { useCreateCounterparty } from '@/counterparty/hooks/use-create-counterparty';
import { counterpartyMapper } from '@/counterparty/lib/mappers/counterparty.mapper';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useJurisdictions } from '@/shared/hooks/use-jurisdictions';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ContractorForm } from './contractor-form';
import { ContractorFormSkeleton } from './skeleton';
import type {
  ContractorFormCreateContainerProps,
  IContractorFormValues,
} from './types';

export function ContractorFormCreateContainer({
  onSuccess,
  onBusyChange,
}: Readonly<ContractorFormCreateContainerProps>) {
  const { t } = useTranslation('counterparty');
  const handleApiError = useApiErrorHandler();
  const { data: jurisdictions = [], isPending } = useJurisdictions();

  const { mutateAsync: createCounterparty, isPending: isCreating } =
    useCreateCounterparty();

  useEffect(() => {
    onBusyChange?.(isCreating);

    return () => onBusyChange?.(false);
  }, [isCreating, onBusyChange]);

  const handleSubmit = async (values: IContractorFormValues) => {
    if (isCreating) return;

    try {
      await createCounterparty(
        counterpartyMapper.toContractorCreateReq(values)
      );
      toast.success(t('contractor_created_success_text'));
      onSuccess();
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  if (isPending) return <ContractorFormSkeleton />;

  return (
    <ContractorForm
      onSubmit={handleSubmit}
      jurisdictions={jurisdictions}
      loading={isCreating}
      disabled={isCreating}
    />
  );
}
