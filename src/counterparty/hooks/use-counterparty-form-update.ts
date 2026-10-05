import { useUpdateCounterparty } from '@/counterparty/hooks/use-update-counterparty';
import {
  hasCounterpartyChanges,
  isCounterpartyTypeConflict,
} from '@/counterparty/lib/utils/counterparty-form';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import apiErrors from '@/shared/i18n/locales/en/api-errors.json';
import type {
  ICounterpartyDto,
  ICounterpartyUpdateReq,
} from '@/shared/lib/api/Api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface ICounterpartyFormUpdateOptions {
  counterpartyId: string;
  counterparty?: ICounterpartyDto;
  ready: boolean;
  onSuccess: () => void;
}

export function useCounterpartyFormUpdate({
  counterpartyId,
  counterparty,
  ready,
  onSuccess,
}: ICounterpartyFormUpdateOptions) {
  const { t } = useTranslation(['counterparty', 'api-errors']);

  const [session, setSession] = useState<{
    id: string;
    baseline?: ICounterpartyDto;
  }>({ id: counterpartyId });

  const update = useUpdateCounterparty(counterpartyId);
  const handleApiError = useApiErrorHandler();
  const baseline = session.id === counterpartyId ? session.baseline : undefined;

  // Capture a version once per edit session; background reads cannot advance it.
  if (session.id !== counterpartyId) setSession({ id: counterpartyId });
  else if (!baseline && ready && counterparty?.id === counterpartyId)
    setSession({ id: counterpartyId, baseline: counterparty });

  const handleUpdate = async (request: ICounterpartyUpdateReq) => {
    if (!baseline || baseline.status === 'archived' || update.isPending) return;

    if (!hasCounterpartyChanges(request)) {
      onSuccess();

      return;
    }

    try {
      await update.mutateAsync(request);
      toast.success(t('counterparty:counterparty_updated_success_text'));
      onSuccess();
    } catch (value) {
      const error = handleApiError(value);
      if (!error) return;

      if (isCounterpartyTypeConflict(value)) {
        toast.error(t('counterparty:type_locked_description'));

        return;
      }

      const key = error.errorKey as keyof typeof apiErrors;
      toast.error(
        Object.hasOwn(apiErrors, key)
          ? t(`api-errors:${key}`)
          : t('counterparty:update_error_text')
      );
    }
  };

  return { baseline, saving: update.isPending, handleUpdate };
}
