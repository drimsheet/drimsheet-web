import type {
  CreateIncomeCategoryFormProps,
  IIncomeCategoryDraft,
} from '@/accounting/components/income-categories-form/types';
import { incomeCategorySchema } from '@/accounting/components/income-categories-form/validation';
import { Button } from '@/shared/components/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
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
import { useFormik } from 'formik';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

export function CreateIncomeCategoryForm({
  groups,
  categories,
  disabled,
  onSubmit,
  onCancel,
}: Readonly<CreateIncomeCategoryFormProps>) {
  const { t } = useTranslation('accounting');
  const fieldId = useId();

  const formik = useFormik<IIncomeCategoryDraft>({
    initialValues: { parentId: '', name: '' },
    validationSchema: incomeCategorySchema(t, groups, categories),
    onSubmit: (values) => onSubmit({ ...values, name: values.name.trim() }),
  });

  const parentError = formik.touched.parentId && formik.errors.parentId;
  const nameError = formik.touched.name && formik.errors.name;

  const title = t('income_category_create_title');
  const description = t('income_category_create_description');
  const parent_label = t('income_category_parent_label');
  const parent_placeholder = t('income_category_parent_placeholder');
  const name_label = t('income_category_name_label');
  const cancel_label = t('income_category_cancel_label');
  const add_label = t('income_category_save_label');

  return (
    <form
      onSubmit={formik.handleSubmit}
      noValidate
      aria-labelledby={`${fieldId}-title`}
    >
      <FieldSet disabled={disabled}>
        <div className="flex flex-col gap-1">
          <h2 id={`${fieldId}-title`} className="text-base font-semibold">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <FieldGroup className="gap-5">
          <Field data-invalid={!!parentError}>
            <FieldLabel htmlFor={`${fieldId}-parent`}>
              {parent_label}
            </FieldLabel>
            <Select
              value={formik.values.parentId}
              onValueChange={(value) => formik.setFieldValue('parentId', value)}
              disabled={disabled}
            >
              <SelectTrigger
                autoFocus
                id={`${fieldId}-parent`}
                className="w-full"
                onBlur={() => formik.setFieldTouched('parentId', true)}
                aria-invalid={!!parentError}
                aria-describedby={
                  parentError ? `${fieldId}-parent-error` : undefined
                }
              >
                <SelectValue placeholder={parent_placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {parentError && (
              <FieldError id={`${fieldId}-parent-error`}>
                {parentError}
              </FieldError>
            )}
          </Field>
          <Field data-invalid={!!nameError}>
            <FieldLabel htmlFor={`${fieldId}-name`}>{name_label}</FieldLabel>
            <Input
              id={`${fieldId}-name`}
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={!!nameError}
              aria-describedby={nameError ? `${fieldId}-name-error` : undefined}
            />
            {nameError && (
              <FieldError id={`${fieldId}-name-error`}>{nameError}</FieldError>
            )}
          </Field>
        </FieldGroup>
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancel_label}
          </Button>
          <Button type="submit">{add_label}</Button>
        </div>
      </FieldSet>
    </form>
  );
}
