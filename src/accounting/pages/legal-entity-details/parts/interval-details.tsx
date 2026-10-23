import { Button } from '@/shared/components/button';
import { Separator } from '@/shared/components/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/tooltip';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import helpers from '../helper';
import type { IntervalDetailsProps } from '../types';
import { PeriodSummary } from './period-summary';

export function IntervalDetails({
  kind,
  interval,
  now,
}: Readonly<IntervalDetailsProps>) {
  const { t, i18n } = useTranslation('accounting');
  const period = helpers.currentPeriod(interval, now);
  const title = t(`details_${kind}_interval_title`);
  const unit_label = t(`details_interval_${interval.unit}`);

  const range_text = t('details_date_range', {
    start: helpers.formatDate(interval.startDate, i18n.language),
    end: helpers.formatDate(interval.endDate, i18n.language, true),
  });

  const view_label = t('details_view_periods_label');
  const view_aria_label = t(`details_view_${kind}_periods_label`);
  const unavailable_text = t('details_period_sheet_unavailable');
  const empty_text = t('details_no_current_period');

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Separator />
      <div className="flex flex-col gap-2">
        <h4 className="m-0 text-xs font-normal text-muted-foreground">
          {title}
        </h4>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-medium">{unit_label}</span>
          <span className="ml-auto text-right text-xs text-muted-foreground tabular-nums">
            {range_text}
          </span>
        </div>
      </div>
      {period ? (
        <PeriodSummary
          name={period.name}
          ordinal={period.ordinal}
          count={interval.count}
          startDate={period.startDate}
          endDate={period.endDate}
          status={'status' in period ? period.status : undefined}
        />
      ) : (
        <p className="m-0 rounded-md bg-muted p-4 text-sm text-muted-foreground">
          {empty_text}
        </p>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="w-fit">
            <Button variant="link" disabled aria-label={view_aria_label}>
              {view_label}
              <ArrowUpRight data-icon="inline-end" aria-hidden />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{unavailable_text}</TooltipContent>
      </Tooltip>
    </div>
  );
}
