import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { Skeleton } from '@/shared/components/skeleton';
import { StatusBadge } from '@/shared/components/status-badge';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import helpers from '../helper';
import type { FiscalYearSummaryProps } from '../types';

export function FiscalYearSummary({
  years,
  selected,
  onChange,
}: Readonly<FiscalYearSummaryProps>) {
  const { t, i18n } = useTranslation('accounting');
  const year_label = t('details_fiscal_year_label');
  const status_label = t(`details_status_${selected.status}`);

  const range_text = t('details_date_range', {
    start: helpers.formatDate(selected.startDate, i18n.language),
    end: helpers.formatDate(selected.endDate, i18n.language),
  });

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-md bg-muted p-5">
      <div className="flex min-w-0 flex-col items-start gap-1">
        <span className="text-xs text-muted-foreground">{year_label}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              aria-label={`${year_label}: ${selected.name}`}
            >
              <span className="text-xl font-medium">{selected.name}</span>
              <ChevronDown data-icon="inline-end" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup
              value={selected.id}
              onValueChange={onChange}
            >
              {years.map((year) => (
                <DropdownMenuRadioItem value={year.id} key={year.id}>
                  {year.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="ml-auto flex flex-col items-end gap-2">
        <StatusBadge
          variant={selected.status === 'open' ? 'success' : 'neutral'}
          label={status_label}
        />
        <span className="text-right text-xs text-muted-foreground tabular-nums">
          {range_text}
        </span>
      </div>
    </div>
  );
}

export function FiscalYearSummarySkeleton() {
  const { t } = useTranslation('accounting');
  const loading_label = t('details_loading_label');

  return (
    <div
      aria-busy="true"
      className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-md bg-muted p-5"
    >
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <div className="flex min-w-0 flex-col items-start gap-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="ml-auto flex flex-col items-end gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-48 max-w-full" />
      </div>
    </div>
  );
}
