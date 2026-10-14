import { Alert, AlertDescription } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import {
  ETSupportedExpenseAccountBehavior,
  ETSupportedRevenueAccountBehavior,
} from '@/shared/lib/api/Api';
import { useFormik } from 'formik';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { CategoryFormProps } from './types';
import { categoryFormSchema } from './validation';

export function CategoryForm({
  initialValues,
  editing,
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

  const behaviors = Object.values(
    form.values.type === 'revenue'
      ? ETSupportedRevenueAccountBehavior
      : ETSupportedExpenseAccountBehavior
  );

  const nameError = form.touched.name && form.errors.name;
  const behaviorError = form.touched.behavior && form.errors.behavior;

  const handleTypeChange = (type: 'revenue' | 'expense') => {
    void form.setValues({
      name: form.values.name,
      type,
      behavior: type === 'revenue' ? 'services' : 'default_direct_cost',
    });
  };

  const name_label = t('categories_name_label');
  const type_label = t('categories_type_label');
  const revenue_label = t('categories_type_revenue');
  const expense_label = t('categories_type_expense');
  const behavior_label = t('categories_behavior_label');

  const submit_label = editing
    ? t('categories_save_label')
    : t('categories_add_label');

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
        {!editing && (
          <>
            <Field>
              <FieldLabel htmlFor={`${id}-type`}>{type_label}</FieldLabel>
              <Select
                value={form.values.type}
                onValueChange={handleTypeChange}
                disabled={pending}
              >
                <SelectTrigger id={`${id}-type`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="revenue">{revenue_label}</SelectItem>
                    <SelectItem value="expense">{expense_label}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!behaviorError}>
              <FieldLabel htmlFor={`${id}-behavior`}>
                {behavior_label}
              </FieldLabel>
              <Select
                value={form.values.behavior}
                onValueChange={(value) =>
                  void form.setFieldValue('behavior', value)
                }
                disabled={pending}
              >
                <SelectTrigger
                  id={`${id}-behavior`}
                  className="w-full"
                  aria-invalid={!!behaviorError}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {behaviors.map((behavior) => (
                      <SelectItem key={behavior} value={behavior}>
                        {t(`categories_behavior_${behavior}`)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {behaviorError && <FieldError>{behaviorError}</FieldError>}
            </Field>
          </>
        )}
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
