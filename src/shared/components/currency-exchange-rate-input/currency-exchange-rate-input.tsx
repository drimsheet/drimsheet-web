import { Button } from '@/shared/components/button';
import { FieldDescription } from '@/shared/components/field';
import { InputGroup, InputGroupAddon } from '@/shared/components/input-group';
import { MoneyInput } from '@/shared/components/money-input';
import { currencyService } from '@/shared/lib/services/currency.service';
import { cn } from '@/shared/lib/utils/cn';
import { ArrowRightLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import helpers from './helper';
import type { CurrencyExchangeRateInputProps } from './types';

const moneyInputClassName =
  'flex-1 rounded-none border-0 bg-transparent text-right tabular-nums shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent';

export function CurrencyExchangeRateInput({
  baseCurrency,
  targetCurrency,
  displayOfficialRate = false,
  value,
  className,
  'aria-label': ariaLabel,
  disabled,
  layout = 'default',
  officialRate,
  onChange,
  ...props
}: Readonly<CurrencyExchangeRateInputProps>) {
  const { t } = useTranslation<'shared'>('shared');
  const isCompact = layout === 'compact';
  const inverted = value?.inverted ?? false;
  const displayedBaseCurrency = inverted ? targetCurrency : baseCurrency;
  const displayedTargetCurrency = inverted ? baseCurrency : targetCurrency;

  const displayedOfficialRate = inverted
    ? currencyService.invertRate(officialRate?.rate)
    : officialRate?.rate;

  const resolvedValue = helpers.getValue(value?.value, displayedOfficialRate);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      onChange(null);

      return;
    }

    onChange({ value: Number(event.target.value), inverted });
  };

  const handleInvert = () => {
    const invertedRate = currencyService.invertRate(resolvedValue);

    const nextInverted = !inverted;

    if (invertedRate === undefined) {
      onChange(null);

      return;
    }

    onChange({ value: invertedRate, inverted: nextInverted });
  };

  const official_rate_available_text = t(
    'official_exchange_rate_available_text'
  );

  const official_rate_unavailable_text = t(
    'official_exchange_rate_unavailable_text'
  );

  const invert_exchange_rates_action = t('invert_exchange_rates_action');

  return (
    <div
      className={cn(displayOfficialRate && 'flex w-full flex-col gap-1')}
      data-slot="currency-exchange-rate-input"
      data-layout={layout}
    >
      <div
        className={cn(
          'flex items-center gap-4',
          isCompact &&
            'grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1.25fr)_auto] gap-2',
          displayOfficialRate && 'w-full'
        )}
      >
        <InputGroup className={cn('w-28', isCompact && 'w-full')} data-disabled>
          <MoneyInput
            aria-label={`${displayedBaseCurrency} base amount`}
            className={moneyInputClassName}
            currencyCode={displayedBaseCurrency}
            data-slot="input-group-control"
            disabled
            value={1}
          />
          <InputGroupAddon align="inline-start" className="text-foreground">
            {displayedBaseCurrency}
          </InputGroupAddon>
        </InputGroup>

        <ArrowRightLeft aria-hidden="true" className="size-4 shrink-0" />

        <InputGroup
          className={cn('w-36', isCompact && 'w-full')}
          data-disabled={disabled || undefined}
        >
          <MoneyInput
            {...props}
            aria-label={ariaLabel ?? `${displayedTargetCurrency} exchange rate`}
            className={cn(moneyInputClassName, className)}
            currencyCode={displayedTargetCurrency}
            data-slot="input-group-control"
            decimalType="number"
            disabled={disabled}
            onChange={handleChange}
            value={resolvedValue}
          />
          <InputGroupAddon align="inline-start" className="text-foreground">
            {displayedTargetCurrency}
          </InputGroupAddon>
        </InputGroup>

        <Button
          className="shrink-0"
          disabled={disabled}
          onClick={handleInvert}
          type="button"
          variant="secondary"
        >
          {invert_exchange_rates_action}
        </Button>
      </div>

      {displayOfficialRate && officialRate && (
        <FieldDescription className="text-xs text-success">
          {official_rate_available_text}{' '}
          <span className="font-semibold">{displayedOfficialRate}</span>
        </FieldDescription>
      )}

      {displayOfficialRate && !officialRate && (
        <FieldDescription className="text-xs text-warning">
          {official_rate_unavailable_text}
        </FieldDescription>
      )}
    </div>
  );
}
