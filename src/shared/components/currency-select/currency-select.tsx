import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/components/combobox';
import { CurrencyLogo } from '@/shared/components/currency-logo';
import { Field, FieldError } from '@/shared/components/field';
import { InputGroupAddon } from '@/shared/components/input-group';
import { Label } from '@/shared/components/label';
import countries from '@/shared/configs/countries.json' with { type: 'json' };
import uiCurrencies from '@/shared/configs/currencies.json' with { type: 'json' };
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CurrencySelectProps, ICurrency } from './types';

export function CurrencySelect({
  label,
  id = 'currency-select',
  disabled = false,
  value,
  currencies,
  onChange,
  error,
  displayCode = false,
}: Readonly<CurrencySelectProps>) {
  const { t } = useTranslation('shared');
  const [search, setSearch] = useState('');

  const mappedCurrencies = useMemo(() => {
    return currencies.map((c) => {
      const uiCurrency = uiCurrencies.find((uc) => uc.code === c.code);

      return {
        ...c,
        logo: uiCurrency?.logo || '',
      };
    });
  }, [currencies]);

  const mapItemToStringLabel = (item: ICurrency | null) => {
    if (!item) {
      return '';
    }

    return displayCode ? item.code : item.name;
  };

  const options = useMemo(() => {
    const lowerVal = search.toLowerCase();

    const matchingCountries = countries.filter((c) =>
      c.name.toLowerCase().includes(lowerVal)
    );

    const matchingCurrencyCodes = new Set(
      matchingCountries.map((c) => c.currencyCode)
    );

    return mappedCurrencies.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerVal) ||
        c.code.toLowerCase().includes(lowerVal) ||
        c.symbol.toLowerCase().includes(lowerVal) ||
        matchingCurrencyCodes.has(c.code)
    );
  }, [mappedCurrencies, search]);

  const selectedCurrency = mappedCurrencies.find((c) => c.code === value);

  const placeholder_text = t('currency_select_placeholder');
  const empty_text = t('currencies_empty_text');
  const hasError = Boolean(error?.some((item) => item?.message));

  return (
    <Field data-invalid={hasError}>
      <Label htmlFor={id}>{label}</Label>
      <Combobox
        items={options}
        disabled={disabled}
        autoHighlight
        value={selectedCurrency ?? null}
        onValueChange={(val: ICurrency | null) => onChange(val ? val.code : '')}
        itemToStringLabel={mapItemToStringLabel}
        onInputValueChange={setSearch}
      >
        <ComboboxInput
          id={id}
          disabled={disabled}
          placeholder={placeholder_text}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        >
          <InputGroupAddon>
            <CurrencyLogo url={selectedCurrency?.logo} />
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxContent alignOffset={-28} className="w-full">
          <ComboboxEmpty>{empty_text}</ComboboxEmpty>
          <ComboboxList>
            {options.map((item) => (
              <ComboboxItem key={item.code} value={item} className="z-400">
                <div className="flex items-center gap-2">
                  <CurrencyLogo url={item.logo} />
                  <span>{item.name}</span>
                  <span className="text-muted-foreground ml-auto">
                    {item.code} ({item.symbol})
                  </span>
                </div>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldError id={`${id}-error`} errors={error} />
    </Field>
  );
}
