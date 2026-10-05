import { useCreateCounterparty } from '@/counterparty/hooks/use-create-counterparty';
import { counterpartyMapper } from '@/counterparty/lib/mappers/counterparty.mapper';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useJurisdictions } from '@/shared/hooks/use-jurisdictions';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { EmployerForm } from './employer-form';
import { EmployerFormSkeleton } from './skeleton';
import type {
  EmployerFormCreateContainerProps,
  IEmployerFormValues,
} from './types';

export function EmployerFormCreateContainer({
  onSuccess,
  onBusyChange,
}: Readonly<EmployerFormCreateContainerProps>) {
  const { t } = useTranslation('counterparty');
  const handleApiError = useApiErrorHandler();
  const { data: jurisdictions = [], isPending } = useJurisdictions();

  const { mutateAsync: createCounterparty, isPending: isCreating } =
    useCreateCounterparty();

  useEffect(() => {
    onBusyChange?.(isCreating);

    return () => onBusyChange?.(false);
  }, [isCreating, onBusyChange]);

  const handleSubmit = async (values: IEmployerFormValues) => {
    if (isCreating) return;

    try {
      await createCounterparty(counterpartyMapper.toEmployerCreateReq(values));
      toast.success(t('employer_created_success_text'));
      onSuccess();
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  if (isPending) return <EmployerFormSkeleton />;

  return (
    <EmployerForm
      onSubmit={handleSubmit}
      jurisdictions={jurisdictions}
      loading={isCreating}
      disabled={isCreating}
    />
  );
}
