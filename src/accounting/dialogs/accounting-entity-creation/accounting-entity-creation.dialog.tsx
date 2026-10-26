import {
  AccountingEntityForm,
  AccountingEntityFormSkeleton,
  type IAccountingEntityFormValues,
} from '@/accounting/components/accounting-entity-form';
import { useCreateAccountingEntity } from '@/accounting/hooks/use-create-accounting-entity';
import { accountingEntityMapper } from '@/accounting/lib/mappers/onboarding.mapper';
import { Alert, AlertDescription } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useCurrencies } from '@/shared/hooks/use-currencies';
import { useJurisdictions } from '@/shared/hooks/use-jurisdictions';
import type { IAccountingEntity } from '@/shared/lib/api/Api';
import { useQueryClient } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { AccountingEntityCreationDialogProps } from './types';

export function AccountingEntityCreationDialog({
  onClose,
  onCloseAutoFocus,
}: Readonly<AccountingEntityCreationDialogProps>) {
  const { t } = useTranslation('accounting');
  const queryClient = useQueryClient();
  const formId = useId();
  const [submitting, setSubmitting] = useState(false);
  const handleApiError = useApiErrorHandler();
  const currencies = useCurrencies();

  const jurisdictions = useJurisdictions({
    throwOnError: false,
    scope: 'dialog',
  });

  const creation = useCreateAccountingEntity();

  const isLoading = currencies.isPending || jurisdictions.isPending;

  const hasOptionsError =
    !isLoading &&
    (currencies.isError ||
      jurisdictions.isError ||
      !currencies.data?.length ||
      !jurisdictions.data?.length);

  const canShowForm = !isLoading && !hasOptionsError;

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  const handleSubmit = async (values: IAccountingEntityFormValues) => {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const entity = await creation.mutateAsync(
        accountingEntityMapper.toDto(values)
      );

      const queryKey = ['accountingService', 'getAccountingEntities'];

      // Keep the successful creation visible even if the follow-up refresh fails.
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<IAccountingEntity[]>(queryKey, (existing) => [
        ...(existing ?? []).filter(({ id }) => id !== entity.id),
        entity,
      ]);
      void queryClient.invalidateQueries({ queryKey });
      toast.success(t('legal_entity_created_success'));
      onClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const title = t('legal_entities_add_label');
  const description = t('legal_entity_create_description');
  const options_error = t('legal_entity_options_error');
  const submit_error = t('legal_entity_create_error');
  const cancel_label = t('legal_entity_cancel_label');
  const submit_label = t('legal_entity_create_label');

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
        showCloseButton={!submitting}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {isLoading && <AccountingEntityFormSkeleton />}
        {hasOptionsError && (
          <Alert variant="destructive">
            <AlertDescription>
              <div className="flex flex-col items-start gap-3">
                <span>{options_error}</span>
              </div>
            </AlertDescription>
          </Alert>
        )}
        {canShowForm && (
          <AccountingEntityForm
            id={formId}
            currencies={currencies.data ?? []}
            jurisdictions={jurisdictions.data ?? []}
            disabled={submitting}
            onSubmit={handleSubmit}
          />
        )}
        {creation.isError && (
          <Alert variant="destructive">
            <AlertDescription>{submit_error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={handleClose}
          >
            {cancel_label}
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={!canShowForm}
            loading={submitting}
          >
            {submit_label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
