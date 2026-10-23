import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import { RadioGroup, RadioGroupItem } from '@/shared/components/radio-group';
import { Separator } from '@/shared/components/separator';
import { Info } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { CategoryCreationFormProps } from '../types';
import { CategoryParentPicker } from './parent-picker';
import { PromotionPreview } from './promotion-preview';

export function CategoryCreationForm({
  form,
  parent,
  accounts,
  loadingAccounts,
  accountsError,
  pending,
  error,
  onTypeChange,
  onParentChange,
  onPickerOpenChange,
  onCancel,
}: Readonly<CategoryCreationFormProps>) {
  const { t } = useTranslation('ledger-accounts');
  const id = useId();
  const nameError = form.touched.name && form.errors.name;
  const typeError = form.touched.type && form.errors.type;
  const parentError = form.touched.parentId ? form.errors.parentId : undefined;

  const postingError =
    form.touched.postingAccountName && form.errors.postingAccountName;

  const isPromotion = !!parent && !parent.account.isControlAccount;
  const type_label = t('category_creation_type_label');
  const income_label = t('category_creation_income_label');
  const expenses_label = t('category_creation_expenses_label');
  const name_label = t('categories_name_label');
  const name_placeholder = t('category_creation_name_placeholder');
  const required_label = t('category_creation_required_label');
  const promotion_title = t('category_creation_promotion_title');

  const promotion_description = t('category_creation_promotion_description', {
    name: parent?.account.name,
  });

  const posting_label = t('category_creation_posting_name_label');
  const posting_placeholder = t('category_creation_posting_placeholder');
  const posting_description = t('category_creation_posting_name_description');
  const cancel_label = t('categories_cancel_label');
  const submit_label = t('category_creation_title');
  const error_text = t('categories_save_error_text');

  return (
    <form
      onSubmit={form.handleSubmit}
      noValidate
      className="flex flex-col gap-8"
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error_text}</AlertDescription>
        </Alert>
      )}
      <FieldGroup>
        <FieldSet disabled={pending}>
          <FieldLegend variant="label" id={`${id}-type-label`}>
            {type_label}{' '}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {required_label}
            </span>
          </FieldLegend>
          <RadioGroup
            aria-labelledby={`${id}-type-label`}
            value={form.values.type}
            onValueChange={onTypeChange}
            orientation="horizontal"
            className="flex flex-wrap gap-8"
            aria-required
            aria-invalid={!!typeError}
            aria-describedby={typeError ? `${id}-type-error` : undefined}
            disabled={pending}
          >
            <Field orientation="horizontal" className="w-auto">
              <RadioGroupItem id={`${id}-income`} value="revenue" />
              <FieldLabel htmlFor={`${id}-income`}>{income_label}</FieldLabel>
            </Field>
            <Field orientation="horizontal" className="w-auto">
              <RadioGroupItem id={`${id}-expenses`} value="expense" />
              <FieldLabel htmlFor={`${id}-expenses`}>
                {expenses_label}
              </FieldLabel>
            </Field>
          </RadioGroup>
          {typeError && (
            <FieldError id={`${id}-type-error`}>{typeError}</FieldError>
          )}
        </FieldSet>
        <CategoryParentPicker
          type={form.values.type}
          parent={parent}
          accounts={accounts}
          loading={loadingAccounts}
          error={accountsError}
          disabled={pending}
          validationError={parentError}
          onSelect={onParentChange}
          onOpenChange={onPickerOpenChange}
        />
        {isPromotion && (
          <FieldGroup>
            <Alert variant="info">
              <Info aria-hidden />
              <AlertTitle>{promotion_title}</AlertTitle>
              <AlertDescription>{promotion_description}</AlertDescription>
            </Alert>
            <Field data-invalid={!!postingError}>
              <FieldLabel htmlFor={`${id}-posting-name`}>
                {posting_label}
                <span className="text-xs font-normal text-muted-foreground">
                  {required_label}
                </span>
              </FieldLabel>
              <Input
                id={`${id}-posting-name`}
                name="postingAccountName"
                value={form.values.postingAccountName}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                placeholder={posting_placeholder}
                disabled={pending}
                aria-required
                aria-invalid={!!postingError}
                aria-describedby={`${id}-posting-help${postingError ? ` ${id}-posting-error` : ''}`}
              />
              <FieldDescription id={`${id}-posting-help`}>
                {posting_description}
              </FieldDescription>
              {postingError && (
                <FieldError id={`${id}-posting-error`}>
                  {postingError}
                </FieldError>
              )}
            </Field>
          </FieldGroup>
        )}
        <Field data-invalid={!!nameError}>
          <FieldLabel htmlFor={`${id}-name`}>
            {name_label}
            <span className="text-xs font-normal text-muted-foreground">
              {required_label}
            </span>
          </FieldLabel>
          <Input
            id={`${id}-name`}
            name="name"
            value={form.values.name}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            placeholder={name_placeholder}
            disabled={pending}
            aria-required
            aria-invalid={!!nameError}
            aria-describedby={nameError ? `${id}-name-error` : undefined}
          />
          {nameError && (
            <FieldError id={`${id}-name-error`}>{nameError}</FieldError>
          )}
        </Field>
      </FieldGroup>
      {isPromotion && parent && (
        <PromotionPreview
          parentName={parent.account.name}
          postingAccountName={form.values.postingAccountName}
          categoryName={form.values.name}
        />
      )}
      <Separator />
      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
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
