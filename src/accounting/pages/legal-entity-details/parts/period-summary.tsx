import { Badge } from '@/shared/components/badge';
import { useTranslation } from 'react-i18next';
import helpers from '../helper';
import type { PeriodSummaryProps } from '../types';

export function PeriodSummary({
  name,
  ordinal,
  count,
  startDate,
  endDate,
  status,
}: Readonly<PeriodSummaryProps>) {
  const { t, i18n } = useTranslation('accounting');
  const current_label = t('financial_period_current_label');
  const ordinal_text = t('details_period_ordinal', { ordinal, count });

  const range_text = t('details_date_range', {
    start: helpers.formatDate(startDate, i18n.language),
    end: helpers.formatDate(endDate, i18n.language, true),
  });

  const status_label = status ? t(`details_status_${status}`) : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-md bg-muted p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h4 className="m-0 break-words text-base font-medium">{name}</h4>
          <Badge variant="ghost" className="bg-background text-link">
            {current_label}
          </Badge>
        </div>
        {status_label && (
          <Badge
            variant="ghost"
            className={
              status === 'open'
                ? 'shrink-0 bg-success-surface text-success'
                : 'shrink-0'
            }
          >
            {status_label}
          </Badge>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
        <span className="shrink-0">{ordinal_text}</span>
        <span className="text-right tabular-nums">{range_text}</span>
      </div>
    </div>
  );
}
