import { legalEntityMapper } from '@/accounting/lib/mappers/legal-entity.mapper';
import { accountingService } from '@/accounting/lib/services/accounting.service';
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import type { IAccountingEntity } from '@/shared/lib/api/Api';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { LegalEntityActionDialogProps } from './types';
import { createEntityNameSchema } from './validation';

export function LegalEntityActionDialog({
  action,
  entity,
  isCurrent,
  onClose,
  onCloseAutoFocus,
}: Readonly<LegalEntityActionDialogProps>) {
  const { t } = useTranslation('accounting');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const formId = useId();

  const [errorKey, setErrorKey] = useState<
    'details_action_error' | 'details_delete_conflict'
  >();

  const handleApiError = useApiErrorHandler();

  const handleSubmit = async (values: Pick<IAccountingEntity, 'name'>) => {
    setErrorKey(undefined);
    try {
      const detailKey = ['accountingService', 'getEntityDetails', entity.id];
      const listKey = ['accountingService', 'getAccountingEntities'];
      let updated: IAccountingEntity | undefined;
      if (action === 'edit')
        updated = await accountingService.updateEntity(
          entity.id,
          legalEntityMapper.toUpdateDto(values)
        );

      if (action === 'archive') {
        await accountingService.archiveEntity(entity.id);
        updated = { ...entity, status: 'archived' };
      }

      if (action === 'delete') await accountingService.deleteEntity(entity.id);

      await queryClient.cancelQueries({ queryKey: listKey });
      await queryClient.cancelQueries({ queryKey: detailKey });
      if (updated) queryClient.setQueryData(detailKey, updated);
      else queryClient.removeQueries({ queryKey: detailKey });

      queryClient.setQueryData<IAccountingEntity[]>(listKey, (existing) =>
        existing?.flatMap((item) =>
          item.id !== entity.id
            ? [item]
            : [updated].filter((value): value is IAccountingEntity => !!value)
        )
      );
      void queryClient.invalidateQueries({ queryKey: listKey });
      if (isCurrent && action === 'edit')
        queryClient.setQueryData(
          ['accountingService', 'getAccountingEntity'],
          updated
        );

      toast.success(t(`details_${action}_success`));
      onClose();
      if (isCurrent && action !== 'edit') {
        accountingService.removeAccountingEntity();
        window.location.assign('/legal-entity');

        return;
      }

      if (action === 'delete') navigate('/legal-entity', { replace: true });
    } catch (error) {
      const parsed = handleApiError(error);
      setErrorKey(
        action === 'delete' && parsed?.code === 409
          ? 'details_delete_conflict'
          : 'details_action_error'
      );
    }
  };

  const form = useFormik({
    initialValues: { name: entity.name },
    validationSchema: createEntityNameSchema(t),
    onSubmit: handleSubmit,
  });

  const handleOpenChange = (open: boolean) => {
    if (!open && !form.isSubmitting) onClose();
  };

  const title = t(`details_${action}_title`);
  const description = t(`details_${action}_description`, { name: entity.name });
  const confirm_label = t(`details_${action}_confirm`);
  const cancel_label = t('legal_entity_cancel_label');
  const name_label = t('details_name_label');
  const error_text = errorKey ? t(errorKey) : undefined;

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!form.isSubmitting}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={form.handleSubmit} noValidate>
          {action === 'edit' && (
            <FieldGroup>
              <Field data-invalid={!!(form.touched.name && form.errors.name)}>
                <FieldLabel htmlFor={`${formId}-name`}>{name_label}</FieldLabel>
                <Input
                  id={`${formId}-name`}
                  {...form.getFieldProps('name')}
                  disabled={form.isSubmitting}
                  aria-invalid={!!(form.touched.name && form.errors.name)}
                  aria-describedby={
                    form.touched.name && form.errors.name
                      ? `${formId}-error`
                      : undefined
                  }
                />
                {form.touched.name && form.errors.name && (
                  <FieldError id={`${formId}-error`}>
                    {form.errors.name}
                  </FieldError>
                )}
              </Field>
            </FieldGroup>
          )}
        </form>
        {error_text && (
          <Alert variant="destructive">
            <AlertDescription>{error_text}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button
            variant="ghost"
            disabled={form.isSubmitting}
            onClick={onClose}
          >
            {cancel_label}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant={action === 'delete' ? 'destructive' : 'default'}
            loading={form.isSubmitting}
          >
            {confirm_label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
