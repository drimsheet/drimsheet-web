import type { AccountingEntityCreationFormStep1Props } from '@/accounting/components/accounting-entity-creation-form/types';
import { AccountingEntityTypeSelect } from '@/accounting/components/accounting-entity-type-select';
import { FISCAL_YEAR_STARTS } from '@/accounting/lib/configs/fiscal-year-start.config';
import { AlertTitle, WarningAlert } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import { CountryComboBox } from '@/shared/components/country-combobox';
import { Field, FieldError, FieldGroup } from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import {
  EAccountingEntityType,
  type UAccountingEntityType,
  type UJurisdictionCode,
} from '@/shared/lib/api/Api';
import { dateUtils } from '@/shared/lib/utils/date';
import { AlertCircleIcon, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function AccountingEntityCreationFormStep1({
  formik,
  getErrorMessage,
  individualName,
  jurisdictions,
  onNext,
}: Readonly<AccountingEntityCreationFormStep1Props>) {
  const { t } = useTranslation('accounting');
  const [accountingStandard, setAccountingStandard] = useState('IFRS');

  const nameErrors = getErrorMessage('name');
  const isNameInvalid = Boolean(nameErrors?.length);

  const isComplete =
    !!formik.values.name.trim() &&
    !!formik.values.entityType &&
    !!formik.values.countryCode &&
    !formik.errors.name &&
    !formik.errors.entityType &&
    !formik.errors.countryCode;

  const handleEntityTypeChange = (entityType: UAccountingEntityType) => {
    const selectedCountry = jurisdictions.find(
      (jurisdiction) => jurisdiction.code === formik.values.countryCode
    );

    const standards = selectedCountry?.accountingStandards[entityType];
    const accountingStandardCode = standards?.[0] || 'IFRS';

    const name =
      entityType === EAccountingEntityType.Individual ? individualName : '';

    formik.setValues({
      ...formik.values,
      name,
      entityType,
      accountingStandardCode,
    });
    setAccountingStandard(standards?.join(', ') || 'IFRS');
  };

  const handleCountryChange = (val: string) => {
    const selectedCountry = jurisdictions.find((c) => c.code === val);

    const expectedStart = FISCAL_YEAR_STARTS[val as UJurisdictionCode] || {
      month: 1,
      day: 1,
    };

    const functionalCurrency =
      selectedCountry?.currencyCode || formik.values.functionalCurrency;

    const reportingCurrency =
      selectedCountry?.currencyCode || formik.values.reportingCurrency;

    const { startDate, endDate } = dateUtils.getFiscalYearDateRange(
      expectedStart.month,
      expectedStart.day
    );

    const standards = formik.values.entityType
      ? selectedCountry?.accountingStandards[formik.values.entityType]
      : undefined;

    const accountingStandardCode = standards?.[0] || 'IFRS';

    formik.setValues({
      ...formik.values,
      countryCode: val,
      functionalCurrency,
      reportingCurrency,
      fiscalYearStart: startDate,
      fiscalYearEnd: endDate,
      accountingStandardCode,
    });

    setAccountingStandard(standards?.join(', ') || 'IFRS');
  };

  const showTaxWarning =
    formik.values.countryCode && formik.values.countryCode !== 'NG';

  const showStandardsWarning = !accountingStandard.includes('IFRS');

  const residence_country_label = t('residence_country_label');

  const unsupported_standard_warning = t('unsupported_standard_warning', {
    standard: accountingStandard,
  });

  const nigerian_tax_only_warning = t('nigerian_tax_only_warning');
  const next_button_label = t('next_button_label');
  const entity_name_label = t('entity_name_label');

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <AccountingEntityTypeSelect
          value={formik.values.entityType}
          onChange={handleEntityTypeChange}
          error={getErrorMessage('entityType')}
        />
        <Field data-invalid={isNameInvalid}>
          <Label htmlFor="accounting-entity-name">{entity_name_label}</Label>
          <Input
            id="accounting-entity-name"
            name="name"
            type="text"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={isNameInvalid || undefined}
            aria-describedby={
              isNameInvalid ? 'accounting-entity-name-error' : undefined
            }
          />
          <FieldError id="accounting-entity-name-error" errors={nameErrors} />
        </Field>
        <CountryComboBox
          label={residence_country_label}
          value={formik.values.countryCode}
          jurisdictions={jurisdictions}
          onChange={handleCountryChange}
          error={getErrorMessage('countryCode')}
        />
        {showStandardsWarning && (
          <WarningAlert>
            <AlertCircleIcon />
            <AlertTitle className="text-xs">
              {unsupported_standard_warning}
            </AlertTitle>
          </WarningAlert>
        )}
        {showTaxWarning && (
          <WarningAlert>
            <AlertCircleIcon />
            <AlertTitle className="text-xs">
              {nigerian_tax_only_warning}
            </AlertTitle>
          </WarningAlert>
        )}
      </FieldGroup>
      <div className="flex justify-end mt-4">
        <Button type="button" onClick={onNext} disabled={!isComplete}>
          {next_button_label}
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

export { AccountingEntityCreationFormStep1 };
