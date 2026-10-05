import { useCreateCounterparty } from '@/counterparty/hooks/use-create-counterparty';
import { counterpartyMapper } from '@/counterparty/lib/mappers/counterparty.mapper';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useJurisdictions } from '@/shared/hooks/use-jurisdictions';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { VendorFormSkeleton } from './skeleton';
import type {
  IVendorFormValues,
  VendorFormCreateContainerProps,
} from './types';
import { VendorForm } from './vendor-form';

export function VendorFormCreateContainer({
  onSuccess,
  onBusyChange,
}: Readonly<VendorFormCreateContainerProps>) {
  const { t } = useTranslation('counterparty');
  const handleApiError = useApiErrorHandler();
  const { data: jurisdictions = [], isPending } = useJurisdictions();

  const { mutateAsync: createCounterparty, isPending: isCreating } =
    useCreateCounterparty();

  useEffect(() => {
    onBusyChange?.(isCreating);

    return () => onBusyChange?.(false);
  }, [isCreating, onBusyChange]);

  const handleSubmit = async (values: IVendorFormValues) => {
    if (isCreating) return;

    try {
      await createCounterparty(counterpartyMapper.toVendorCreateReq(values));
      toast.success(t('vendor_created_success_text'));
      onSuccess();
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  if (isPending) return <VendorFormSkeleton />;

  return (
    <VendorForm
      onSubmit={handleSubmit}
      jurisdictions={jurisdictions}
      loading={isCreating}
      disabled={isCreating}
    />
  );
}
