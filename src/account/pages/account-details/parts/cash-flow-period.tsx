import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
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
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {period_label}
      </label>
      <Select value={period} onValueChange={onPeriodChange}>
        <SelectTrigger id={id} className="w-48 border-0 bg-muted">
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
