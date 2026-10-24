import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { Skeleton } from '@/shared/components/skeleton';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { CashFlowPeriodProps } from '../types';

export function CashFlowPeriod({
  period,
  periods,
  onPeriodChange,
}: Readonly<CashFlowPeriodProps>) {
  const { t } = useTranslation('ledger-accounts');
  const id = useId();
  const period_label = t('details_period_label');

  return (
    <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {period_label}
      </label>
      <Select value={period} onValueChange={onPeriodChange}>
        <SelectTrigger id={id} className="min-w-0 flex-1 sm:w-48 sm:flex-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {periods.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function CashFlowPeriodSkeleton() {
  return <Skeleton className="h-9 w-full sm:w-60" />;
}
