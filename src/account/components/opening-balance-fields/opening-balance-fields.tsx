import { Checkbox } from '@/shared/components/checkbox';
import { CurrencyExchangeRateInput } from '@/shared/components/currency-exchange-rate-input';
import { DateInput } from '@/shared/components/date-input';
import { Field, FieldError, FieldGroup } from '@/shared/components/field';
import { Label } from '@/shared/components/label';
import { MoneyInput } from '@/shared/components/money-input';
import { useTranslation } from 'react-i18next';
import type { OpeningBalanceFieldsProps } from './types';

export function OpeningBalanceFields({
  accountingCurrencyCode,
  currencyCode,
  createWithoutOpeningBalance,
  openingBalance,
  openingDate,
  exchangeRate,
  officialExchangeRate,
  disabled = false,
  openingBalanceError,
  openingDateError,
  exchangeRateError,
  onCreateWithoutOpeningBalanceChange,
  onOpeningBalanceChange,
  onOpeningDateChange,
  onExchangeRateChange,
}: Readonly<OpeningBalanceFieldsProps>) {
  const { t } = useTranslation<'ledger-accounts'>('ledger-accounts');

  const showExchangeRate =
    !createWithoutOpeningBalance &&
    Boolean(currencyCode) &&
    currencyCode !== accountingCurrencyCode;

  const openingBalanceDisabled = disabled || createWithoutOpeningBalance;

  const create_without_opening_balance_label = t(
    'create_without_opening_balance_label'
  );

  const opening_balance_label = t('opening_balance_label');
  const opening_date_label = t('opening_date_label');
  const opening_date_placeholder = t('opening_date_placeholder');
  const exchange_rate_label = t('exchange_rate_label');

  return (
    <FieldGroup>
      <Field orientation="horizontal">
        <Checkbox
          aria-label={create_without_opening_balance_label}
          checked={createWithoutOpeningBalance}
          disabled={disabled}
          id="createWithoutOpeningBalance"
          name="createWithoutOpeningBalance"
          onCheckedChange={(checked) =>
            onCreateWithoutOpeningBalanceChange(checked === true)
          }
        />
        <Label htmlFor="createWithoutOpeningBalance">
          {create_without_opening_balance_label}
        </Label>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(openingBalanceError?.length)}>
          <Label htmlFor="openingBalance">{opening_balance_label}</Label>
          <MoneyInput
            aria-invalid={Boolean(openingBalanceError?.length)}
            currencyCode={currencyCode}
            disabled={openingBalanceDisabled}
            id="openingBalance"
            name="openingBalance"
            onChange={onOpeningBalanceChange}
            value={openingBalance}
          />
          <FieldError errors={openingBalanceError} />
        </Field>

        <Field data-invalid={Boolean(openingDateError?.length)}>
          <Label htmlFor="openingDate">{opening_date_label}</Label>
          <DateInput
            aria-invalid={Boolean(openingDateError?.length)}
            disabled={openingBalanceDisabled}
            id="openingDate"
            onValueChange={onOpeningDateChange}
            placeholder={opening_date_placeholder}
            value={openingDate}
          />
          <FieldError errors={openingDateError} />
        </Field>
      </div>

      <div className="min-h-[76px]">
        {showExchangeRate && (
          <Field data-invalid={Boolean(exchangeRateError?.length)}>
            <Label htmlFor="exchangeRate">{exchange_rate_label}</Label>
            <CurrencyExchangeRateInput
              aria-invalid={Boolean(exchangeRateError?.length)}
              aria-label={exchange_rate_label}
              baseCurrency={currencyCode}
              disabled={disabled}
              displayOfficialRate={Boolean(openingDate)}
              id="exchangeRate"
              name="exchangeRate"
              officialRate={officialExchangeRate}
              onChange={onExchangeRateChange}
              targetCurrency={accountingCurrencyCode}
              value={exchangeRate}
            />
            <FieldError errors={exchangeRateError} />
          </Field>
        )}
      </div>
    </FieldGroup>
  );
}
