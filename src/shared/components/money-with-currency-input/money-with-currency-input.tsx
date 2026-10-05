import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/shared/components/combobox';
import { CurrencyLogo } from '@/shared/components/currency-logo';
import { MoneyInput } from '@/shared/components/money-input';
import countries from '@/shared/configs/countries.json' with { type: 'json' };
import uiCurrencies from '@/shared/configs/currencies.json' with { type: 'json' };
import { type ICurrencyDto, type IMoneyDto } from '@/shared/lib/api/Api';
import { cn } from '@/shared/lib/utils/cn';
import { forwardRef, useMemo, useRef, useState } from 'react';
import type { MoneyWithCurrencyInputProps } from './types';

interface CurrencyOption extends ICurrencyDto {
  logo: string;
}

const DEFAULT_CURRENCIES: ICurrencyDto[] = uiCurrencies.map((currency) => ({
  code: currency.code,
  name: currency.name,
  symbol: currency.symbol,
  minorUnit: currency.minorUnit,
}));

const getCurrencySearchText = (currency: CurrencyOption) => {
  const matchingCountries = countries
    .filter((country) => country.currencyCode === currency.code)
    .map((country) => country.name)
    .join(' ');

  return [
    currency.code,
    currency.name,
    currency.symbol,
    matchingCountries,
  ].join(' ');
};

const filterCurrencies = (
  currencies: CurrencyOption[],
  searchValue: string
) => {
  const normalizedSearchValue = searchValue.trim().toLowerCase();
  if (!normalizedSearchValue) return currencies;

  return currencies.filter((currency) =>
    getCurrencySearchText(currency)
      .toLowerCase()
      .includes(normalizedSearchValue)
  );
};

const parseAmount = (amount: string) => {
  const parsedAmount = Number(amount);

  return Number.isNaN(parsedAmount) ? 0 : parsedAmount;
};

const MoneyWithCurrencyInput = forwardRef<
  HTMLInputElement,
  MoneyWithCurrencyInputProps
>(
  (
    {
      amountClassName,
      className,
      currencies = DEFAULT_CURRENCIES,
      currencyDisabled,
      currencyLabel = 'Currency', // TODO: translate
      currencyLabelFormat = 'symbol',
      disabled,
      onChange,
      searchLabel = 'Search currency',
      searchPlaceholder = 'Search',
      showFlag = false,
      value,
      ...moneyInputProps
    },
    ref
  ) => {
    const controlRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const mappedCurrencies = useMemo(() => {
      return currencies.map((currency) => {
        const uiCurrency = uiCurrencies.find(
          (item) => item.code === currency.code
        );

        return {
          ...currency,
          logo: uiCurrency?.logo || '',
        };
      });
    }, [currencies]);

    const selectedCurrency = useMemo(
      () =>
        mappedCurrencies.find(
          (currency) => currency.code === value?.currencyCode
        ),
      [mappedCurrencies, value?.currencyCode]
    );

    const filteredCurrencies = useMemo(
      () => filterCurrencies(mappedCurrencies, searchValue),
      [mappedCurrencies, searchValue]
    );

    const currencyCodeLabel =
      selectedCurrency?.code || value?.currencyCode || 'Currency';

    const currencyDisplayLabel =
      currencyLabelFormat === 'code'
        ? currencyCodeLabel
        : selectedCurrency?.symbol || currencyCodeLabel;

    const currentMoneyValue: IMoneyDto = {
      amount: value?.amount ?? 0,
      currencyCode: value?.currencyCode ?? '',
      isMinorUnit: value?.isMinorUnit ?? false,
    };

    return (
      <Combobox
        items={filteredCurrencies}
        autoHighlight
        inputValue={searchValue}
        open={open}
        value={selectedCurrency ?? null}
        itemToStringLabel={(currency) => currency?.code ?? ''}
        isItemEqualToValue={(currency, value) => currency?.code === value?.code}
        onInputValueChange={setSearchValue}
        onOpenChange={(open) => {
          setOpen(open);
          if (open) setSearchValue('');
        }}
        onValueChange={(currency: CurrencyOption | null) => {
          onChange?.({
            ...currentMoneyValue,
            currencyCode: currency?.code ?? '',
          });
          setSearchValue('');
          setOpen(false);
        }}
      >
        <div
          ref={controlRef}
          className={cn(
            'flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40',
            className
          )}
          data-slot="money-with-currency-input"
        >
          <ComboboxTrigger
            aria-label={`${currencyLabel}: ${currencyCodeLabel}`}
            disabled={disabled || currencyDisabled}
            showIcon={!currencyDisabled}
            className={cn(
              'inline-flex h-full shrink-0 items-center gap-1.5 rounded-none border-0 bg-transparent px-2.5 text-sm font-medium shadow-none transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
              currencyDisabled && !disabled && 'disabled:opacity-100'
            )}
          >
            {showFlag && (
              <CurrencyLogo
                url={selectedCurrency?.logo}
                className="size-5 shrink-0"
              />
            )}
            {currencyLabelFormat !== 'none' && (
              <span className="tabular-nums">{currencyDisplayLabel}</span>
            )}
          </ComboboxTrigger>
          <MoneyInput
            {...moneyInputProps}
            ref={ref}
            aria-label={moneyInputProps['aria-label'] ?? 'Amount'}
            currencyCode={selectedCurrency?.code}
            disabled={disabled}
            value={value?.amount ?? ''}
            onChange={(event) => {
              onChange?.(
                {
                  ...currentMoneyValue,
                  amount: parseAmount(event.target.value),
                },
                event
              );
            }}
            className={cn(
              'h-full rounded-none border-0 bg-transparent text-right shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent',
              amountClassName
            )}
          />
        </div>
        <ComboboxContent
          anchor={controlRef}
          className="w-(--anchor-width) min-w-(--anchor-width)"
        >
          <ComboboxInput
            aria-label={searchLabel}
            className="w-[calc(100%-0.5rem)]"
            placeholder={searchPlaceholder}
            showClear
            showTrigger={false}
          />
          <ComboboxEmpty>No currencies found.</ComboboxEmpty>
          <ComboboxList>
            {filteredCurrencies.map((currency) => (
              <ComboboxItem key={currency.code} value={currency}>
                <CurrencyLogo url={currency.logo} className="size-5 shrink-0" />
                <span className="min-w-0 truncate">{currency.name}</span>
                <span className="ml-auto shrink-0 text-muted-foreground">
                  {currency.symbol}
                </span>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  }
);

MoneyWithCurrencyInput.displayName = 'MoneyWithCurrencyInput';

export { MoneyWithCurrencyInput };
