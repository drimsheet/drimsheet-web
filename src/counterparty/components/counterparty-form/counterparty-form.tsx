import { CounterpartyTypeSelect } from '@/counterparty/components/counterparty-type-select';
import { Button } from '@/shared/components/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldSet,
} from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { useFieldErrorMessage } from '@/shared/hooks/use-field-error-message';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import type { CounterpartyFormProps, ICounterpartyFormValues } from './types';
import { useCounterpartyFormValidation } from './validation';

export function CounterpartyForm({
  onSubmit,
  initialValues,
  loading = false,
  disabled = false,
  className,
  submitLabel,
  onCancel,
  typeRestriction,
  fieldErrors = {},
}: Readonly<CounterpartyFormProps>) {
  const { t } = useTranslation(['counterparty']);
  const validationSchema = useCounterpartyFormValidation();

  const formik = useFormik<ICounterpartyFormValues>({
    initialValues: {
      name: '',
      type: 'individual',
      ...initialValues,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({ ...values, type: typeRestriction?.value ?? values.type });
    },
  });

  const getLocalErrorMessage = useFieldErrorMessage({
    errors: formik.errors,
    touched: formik.touched,
  });

  const getErrorMessage = (field: string) =>
    fieldErrors[field]
      ? [{ message: fieldErrors[field] }]
      : getLocalErrorMessage(field);

  const handleTypeChange = (value: string) => {
    void formik.setFieldValue('type', value);
  };

  const name_label = t('counterparty:name_label');

  const submit_button_label =
    submitLabel ?? t('counterparty:create_button_label');

  const pending_button_label = submitLabel
    ? t('counterparty:saving_label')
    : t('counterparty:continue');

  const cancel_label = t('counterparty:cancel_label');

  return (
    <form onSubmit={formik.handleSubmit} className={className} noValidate>
      <FieldSet disabled={disabled || loading}>
        <FieldGroup className="gap-5">
          <Field data-invalid={Boolean(getErrorMessage('name').length)}>
            <Label htmlFor="counterparty-name">{name_label}</Label>
            <Input
              id="counterparty-name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(getErrorMessage('name').length)}
              disabled={disabled || loading}
            />
            <FieldError errors={getErrorMessage('name')} />
          </Field>

          <CounterpartyTypeSelect
            value={typeRestriction?.value ?? formik.values.type}
            onChange={handleTypeChange}
            error={getErrorMessage('type')}
            description={typeRestriction?.description}
            disabled={Boolean(typeRestriction) || disabled || loading}
          />

          <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                disabled={disabled || loading}
                onClick={onCancel}
              >
                {cancel_label}
              </Button>
            )}
            <Button
              type="submit"
              disabled={disabled || loading}
              className="min-w-[100px]"
            >
              {loading ? pending_button_label : submit_button_label}
            </Button>
          </div>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
