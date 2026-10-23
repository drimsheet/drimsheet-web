import { Alert, AlertDescription } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import { useFieldErrorMessage } from '@/shared/hooks/use-field-error-message';
import { useFormik } from 'formik';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { IProfileFormValues, ProfileFormProps } from './types';
import { useProfileFormValidation } from './validation';

export function ProfileForm({
  initialValues,
  isSaving = false,
  hasError = false,
  onSubmit,
  onCancel,
}: Readonly<ProfileFormProps>) {
  const { t } = useTranslation('user');
  const id = useId();
  const validationSchema = useProfileFormValidation();

  const handleSubmit = async (values: IProfileFormValues) => {
    if (isSaving) return;

    await onSubmit(values);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  const getErrorMessage = useFieldErrorMessage(formik);
  const isBusy = isSaving || formik.isSubmitting;
  const firstNameErrors = getErrorMessage('firstName');
  const lastNameErrors = getErrorMessage('lastName');
  const firstNameInvalid = firstNameErrors.length > 0;
  const lastNameInvalid = lastNameErrors.length > 0;

  const first_name_label = t('profile_first_name_label');
  const last_name_label = t('profile_last_name_label');
  const cancel_label = t('profile_cancel_label');
  const save_label = t('profile_save_label');
  const error_text = t('profile_save_error_text');

  return (
    <form onSubmit={formik.handleSubmit} noValidate aria-busy={isBusy}>
      <FieldSet disabled={isBusy}>
        <FieldGroup className="gap-5">
          <Field data-invalid={firstNameInvalid}>
            <FieldLabel htmlFor={`${id}-first-name`}>
              {first_name_label}
            </FieldLabel>
            <Input
              id={`${id}-first-name`}
              name="firstName"
              autoComplete="given-name"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={firstNameInvalid || undefined}
              aria-describedby={
                firstNameInvalid ? `${id}-first-name-error` : undefined
              }
              disabled={isBusy}
            />
            <FieldError
              id={`${id}-first-name-error`}
              errors={firstNameErrors}
            />
          </Field>
          <Field data-invalid={lastNameInvalid}>
            <FieldLabel htmlFor={`${id}-last-name`}>
              {last_name_label}
            </FieldLabel>
            <Input
              id={`${id}-last-name`}
              name="lastName"
              autoComplete="family-name"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={lastNameInvalid || undefined}
              aria-describedby={
                lastNameInvalid ? `${id}-last-name-error` : undefined
              }
              disabled={isBusy}
            />
            <FieldError id={`${id}-last-name-error`} errors={lastNameErrors} />
          </Field>
          {hasError && (
            <Alert variant="destructive">
              <AlertDescription>{error_text}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={onCancel}
            >
              {cancel_label}
            </Button>
            <Button type="submit" loading={isBusy} disabled={!formik.dirty}>
              {save_label}
            </Button>
          </div>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
