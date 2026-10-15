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
import type { CategoryPeriodProps } from '../types';

export function CategoryPeriod({
  period,
  periods,
  onPeriodChange,
}: Readonly<CategoryPeriodProps>) {
  const { t } = useTranslation('ledger-accounts');
  const id = useId();
  const period_label = t('categories_period_label');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {period_label}
      </label>
      <Select value={period} onValueChange={onPeriodChange}>
        <SelectTrigger id={id} className="w-48">
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
