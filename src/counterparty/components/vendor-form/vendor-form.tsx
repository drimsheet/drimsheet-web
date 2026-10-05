import { CounterpartyAddressFields } from '@/counterparty/components/counterparty-address-fields';
import { CounterpartyTypeSelect } from '@/counterparty/components/counterparty-type-select';
import { Button } from '@/shared/components/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { useFieldErrorMessage } from '@/shared/hooks/use-field-error-message';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import type { IVendorFormValues, VendorFormProps } from './types';
import { useVendorFormValidation } from './validation';

export function VendorForm({
  onSubmit,
  initialValues,
  jurisdictions = [],
  loading = false,
  disabled = false,
  className,
  submitLabel,
  onCancel,
  typeRestriction,
  fieldErrors = {},
  showPostalCode = false,
  showDisplayName = true,
}: Readonly<VendorFormProps>) {
  const { t } = useTranslation(['counterparty']);
  const validationSchema = useVendorFormValidation();

  const formik = useFormik<IVendorFormValues>({
    initialValues: {
      name: '',
      type: 'individual',
      displayName: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        region: '',
        countryCode: '',
      },
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

  const handleAddressChange = (field: string, value: string) => {
    void formik.setFieldValue(field, value);
  };

  const legal_name_label = t('counterparty:legal_name_label');
  const display_name_label = t('counterparty:display_name_label');
  const optional_fields_separator = t('counterparty:optional_fields_separator');

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
            <Label htmlFor="vendor-name">{legal_name_label}</Label>
            <Input
              id="vendor-name"
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

          <FieldSeparator className="my-3">
            {optional_fields_separator}
          </FieldSeparator>

          {showDisplayName && (
            <Field
              data-invalid={Boolean(getErrorMessage('displayName').length)}
            >
              <Label htmlFor="vendor-display-name">{display_name_label}</Label>
              <Input
                id="vendor-display-name"
                name="displayName"
                value={formik.values.displayName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={Boolean(getErrorMessage('displayName').length)}
                disabled={disabled || loading}
              />
              <FieldError errors={getErrorMessage('displayName')} />
            </Field>
          )}

          <CounterpartyAddressFields
            values={formik.values.address}
            errors={formik.errors}
            fieldErrors={fieldErrors}
            touched={formik.touched}
            submitted={formik.submitCount > 0}
            jurisdictions={jurisdictions}
            onChange={handleAddressChange}
            onBlur={formik.handleBlur}
            disabled={disabled || loading}
            showPostalCode={showPostalCode}
            countryRequired={false}
            showOptionalSuffix={false}
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
