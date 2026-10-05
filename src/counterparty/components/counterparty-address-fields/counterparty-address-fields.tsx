import { CountryComboBox } from '@/shared/components/country-combobox';
import { Field, FieldError, FieldGroup } from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { getIn } from 'formik';
import { useTranslation } from 'react-i18next';
import type { CounterpartyAddressFieldsProps } from './types';

export function CounterpartyAddressFields({
  values,
  errors,
  fieldErrors = {},
  touched,
  jurisdictions,
  onChange,
  onBlur,
  disabled = false,
  submitted = false,
  showPostalCode = false,
  countryRequired = false,
  showOptionalSuffix = true,
  namePrefix = 'address',
  className,
}: Readonly<CounterpartyAddressFieldsProps>) {
  const { t } = useTranslation(['counterparty']);

  const getFieldError = (fieldName: string) => {
    const fullPath = `${namePrefix}.${fieldName}`;
    if (fieldErrors[fullPath]) return [{ message: fieldErrors[fullPath] }];

    const err = getIn(errors, fullPath);
    const touch = getIn(touched, fullPath);

    return (touch || submitted) && typeof err === 'string'
      ? [{ message: err }]
      : [];
  };

  const handleChange =
    (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(`${namePrefix}.${fieldName}`, e.target.value);
    };

  const handleCountryChange = (val: string) => {
    onChange(`${namePrefix}.countryCode`, val);
  };

  const optional_suffix = showOptionalSuffix
    ? ` ${t('counterparty:optional_suffix')}`
    : '';

  const address_label = t('counterparty:address_label');
  const address_line2_label = t('counterparty:address_line2_label');
  const postal_code_label = t('counterparty:postal_code_label');
  const city_label = t('counterparty:city_label');
  const state_label = t('counterparty:state_label');

  const country_label =
    t('counterparty:country_label') + (countryRequired ? '' : optional_suffix);

  return (
    <div className={className}>
      <FieldGroup className="gap-5">
        <Field data-invalid={Boolean(getFieldError('line1').length)}>
          <Label htmlFor={`${namePrefix}-line1`}>{address_label}</Label>
          <Input
            id={`${namePrefix}-line1`}
            name={`${namePrefix}.line1`}
            value={values.line1 ?? ''}
            onChange={handleChange('line1')}
            onBlur={onBlur}
            disabled={disabled}
            aria-invalid={Boolean(getFieldError('line1').length)}
          />
          <FieldError errors={getFieldError('line1')} />
        </Field>

        <Field data-invalid={Boolean(getFieldError('line2').length)}>
          <Label htmlFor={`${namePrefix}-line2`} className="sr-only">
            {address_line2_label}
          </Label>
          <Input
            id={`${namePrefix}-line2`}
            name={`${namePrefix}.line2`}
            value={values.line2 ?? ''}
            onChange={handleChange('line2')}
            onBlur={onBlur}
            disabled={disabled}
            aria-invalid={Boolean(getFieldError('line2').length)}
          />
          <FieldError errors={getFieldError('line2')} />
        </Field>

        <CountryComboBox
          id={`${namePrefix}-country`}
          disabled={disabled}
          clearable={showPostalCode && !countryRequired}
          label={country_label}
          value={values.countryCode ?? ''}
          jurisdictions={jurisdictions}
          onChange={handleCountryChange}
          error={getFieldError('countryCode')}
        />

        {showPostalCode && (
          <Field data-invalid={Boolean(getFieldError('postalCode').length)}>
            <Label htmlFor={`${namePrefix}-postalCode`}>
              {postal_code_label}
            </Label>
            <Input
              id={`${namePrefix}-postalCode`}
              name={`${namePrefix}.postalCode`}
              value={values.postalCode ?? ''}
              onChange={handleChange('postalCode')}
              onBlur={onBlur}
              disabled={disabled}
              aria-invalid={Boolean(getFieldError('postalCode').length)}
            />
            <FieldError errors={getFieldError('postalCode')} />
          </Field>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(getFieldError('region').length)}>
            <Label htmlFor={`${namePrefix}-region`}>{state_label}</Label>
            <Input
              id={`${namePrefix}-region`}
              name={`${namePrefix}.region`}
              value={values.region ?? ''}
              onChange={handleChange('region')}
              onBlur={onBlur}
              disabled={disabled}
              aria-invalid={Boolean(getFieldError('region').length)}
            />
            <FieldError errors={getFieldError('region')} />
          </Field>

          <Field data-invalid={Boolean(getFieldError('city').length)}>
            <Label htmlFor={`${namePrefix}-city`}>{city_label}</Label>
            <Input
              id={`${namePrefix}-city`}
              name={`${namePrefix}.city`}
              value={values.city ?? ''}
              onChange={handleChange('city')}
              onBlur={onBlur}
              disabled={disabled}
              aria-invalid={Boolean(getFieldError('city').length)}
            />
            <FieldError errors={getFieldError('city')} />
          </Field>
        </div>
      </FieldGroup>
    </div>
  );
}
