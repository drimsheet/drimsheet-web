import { Badge } from '@/shared/components/badge';
import { FieldError } from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths -- Keep the helper private to this component owner.
import financialYearFormHelpers from '../helper';
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths -- Private parts share their owner's types.
import type { AccountingPeriodsProps } from '../types';

export function AccountingPeriods({
  periods,
  unit,
  currentDate,
  disabled,
  getError,
  onNameChange,
  onNameBlur,
}: Readonly<AccountingPeriodsProps>) {
  const { t, i18n } = useTranslation('accounting');
  const fieldId = useId();
  const title = t('financial_periods_title');
  const count_text = t('financial_periods_count', { count: periods.length });
  const current_label = t('financial_period_current_label');
  const empty_text = t('financial_year_dates_hint');

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`${fieldId}-title`} className="text-sm font-semibold">
          {title}
        </h2>
        <span
          className="text-xs tabular-nums text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {count_text}
        </span>
      </div>
      {!periods.length && (
        <p className="text-sm text-muted-foreground">{empty_text}</p>
      )}
      {periods.length > 0 && (
        <section
          aria-labelledby={`${fieldId}-title`}
          tabIndex={0}
          className="max-h-[400px] overflow-y-auto overscroll-contain rounded-sm p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex flex-col gap-4">
            {periods.map((period, index) => {
              const inputId = `${fieldId}-${index}`;
              const errors = getError(`periods.${index}.name`);
              const hasError = errors.some(({ message }) => Boolean(message));

              const period_label = t(`financial_period_${unit}_label`, {
                index: index + 1,
              });

              const isCurrent =
                period.startDate <= currentDate &&
                currentDate <= period.endDate;

              const descriptionIds = [
                `${inputId}-dates`,
                isCurrent ? `${inputId}-current` : undefined,
                hasError ? `${inputId}-error` : undefined,
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div
                  key={`${unit}-${period.startDate}-${period.endDate}`}
                  className="grid min-w-0 gap-2 sm:grid-cols-2 sm:items-start sm:gap-4"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Label htmlFor={inputId}>{period_label}</Label>
                      {isCurrent && (
                        <Badge id={`${inputId}-current`} variant="secondary">
                          {current_label}
                        </Badge>
                      )}
                    </div>
                    <p
                      id={`${inputId}-dates`}
                      className="text-xs tabular-nums text-muted-foreground"
                    >
                      <time dateTime={period.startDate}>
                        {financialYearFormHelpers.formatDate(
                          period.startDate,
                          i18n.language
                        )}
                      </time>
                      {' – '}
                      <time dateTime={period.endDate}>
                        {financialYearFormHelpers.formatDate(
                          period.endDate,
                          i18n.language
                        )}
                      </time>
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-col gap-2">
                    <Input
                      id={inputId}
                      name={`periods.${index}.name`}
                      value={period.name}
                      disabled={disabled}
                      onChange={(event) =>
                        onNameChange(index, event.target.value)
                      }
                      onBlur={() => onNameBlur(index)}
                      aria-invalid={hasError}
                      aria-describedby={descriptionIds}
                    />
                    <FieldError id={`${inputId}-error`} errors={errors} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
