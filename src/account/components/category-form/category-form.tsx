import { Alert, AlertDescription } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import { useFormik } from 'formik';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { CategoryFormProps } from './types';
import { categoryFormSchema } from './validation';

export function CategoryForm({
  initialValues,
  pending,
  error,
  onSubmit,
  onCancel,
}: Readonly<CategoryFormProps>) {
  const { t } = useTranslation('ledger-accounts');
  const id = useId();

  const form = useFormik({
    initialValues,
    validationSchema: categoryFormSchema(t),
    onSubmit,
  });

  const nameError = form.touched.name && form.errors.name;

  const name_label = t('categories_name_label');
  const submit_label = t('categories_save_label');

  const cancel_label = t('categories_cancel_label');
  const error_text = t('categories_save_error_text');

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error_text}</AlertDescription>
        </Alert>
      )}
      <FieldGroup>
        <Field data-invalid={!!nameError}>
          <FieldLabel htmlFor={`${id}-name`}>{name_label}</FieldLabel>
          <Input
            id={`${id}-name`}
            name="name"
            value={form.values.name}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            disabled={pending}
            aria-invalid={!!nameError}
            aria-describedby={nameError ? `${id}-name-error` : undefined}
          />
          {nameError && (
            <FieldError id={`${id}-name-error`}>{nameError}</FieldError>
          )}
        </Field>
      </FieldGroup>
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={pending}
        >
          {cancel_label}
        </Button>
        <Button type="submit" loading={pending}>
          {submit_label}
        </Button>
      </div>
    </form>
  );
}
