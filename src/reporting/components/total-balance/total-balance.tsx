import { Money } from '@/shared/components/money';
import { cn } from '@/shared/lib/utils/cn';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import totalBalanceHelpers from './helper';
import type { TotalBalanceProps } from './types';

const growthIcons = {
  down: ArrowDownRight,
  neutral: Minus,
  up: ArrowUpRight,
};

const growthClassNames = {
  down: 'text-destructive',
  neutral: 'text-foreground',
  up: 'text-success',
};

export function TotalBalance({
  balance,
  isConverted,
  change,
  label,
  balanceLabel,
  comparisonLabel,
}: Readonly<TotalBalanceProps>) {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'en';

  const growthDirection = change
    ? totalBalanceHelpers.growthDirection(change.amount.amount)
    : undefined;

  const GrowthIcon = growthDirection ? growthIcons[growthDirection] : undefined;

  return (
    <dl className="m-0 flex min-w-0 flex-col gap-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="m-0 flex min-w-0 items-baseline text-3xl font-medium tracking-tight tabular-nums">
        <span className="sr-only">{balanceLabel}</span>

        <Money
          value={balance}
          isConverted={isConverted}
          className="min-w-0 wrap-anywhere"
        />
      </dd>
      {change && GrowthIcon && (
        <dd
          className={cn(
            'm-0 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs',
            growthDirection && growthClassNames[growthDirection]
          )}
        >
          <GrowthIcon className="size-4" aria-hidden />
          <Money value={change.amount} />
          {change.percentageChange !== null && (
            <span>
              (
              {totalBalanceHelpers.formatPercentage(
                change.percentageChange,
                locale
              )}
              )
            </span>
          )}
          {comparisonLabel && (
            <span className="text-muted-foreground">{comparisonLabel}</span>
          )}
        </dd>
      )}
    </dl>
  );
}
