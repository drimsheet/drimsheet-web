import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/chart';
import { Skeleton } from '@/shared/components/skeleton';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import { parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  TransactionActivityChartProps,
  TransactionActivityChartWithStateProps,
} from '../types';

export function TransactionActivityChart({
  days,
  currencyCode,
}: Readonly<TransactionActivityChartProps>) {
  const { t, i18n } = useTranslation('journal-entries');
  const locale = i18n.resolvedLanguage ?? 'en';

  const compact = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol',
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  });

  const dateFormat = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  });

  const hasActivity = days.some(
    ({ revenue, expense }) => revenue !== 0 || expense !== 0
  );

  const inflow_label = t('inflow_tab');
  const outflow_label = t('outflow_tab');
  const chart_label = t('activity_chart_label');

  const config = {
    revenue: { label: inflow_label, color: 'var(--financial-income)' },
    expense: { label: outflow_label, color: 'var(--financial-expense)' },
  };

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <ChartContainer
        config={config}
        className="h-80 w-full aspect-auto sm:h-96"
        role="region"
        aria-label={chart_label}
      >
        <BarChart
          accessibilityLayer
          data={days}
          margin={{ top: 8, left: 0, right: 8, bottom: 8 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) =>
              dateFormat.format(parseISO(value))
            }
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />
          <YAxis
            tickFormatter={(value: number) => compact.format(value)}
            tickLine={false}
            axisLine={false}
            width="auto"
            domain={hasActivity ? ['auto', 'auto'] : [0, 1]}
          />
          <ReferenceLine y={0} stroke="var(--muted-foreground)" />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  dateFormat.format(parseISO(String(value)))
                }
                formatter={(value, name) => (
                  <div className="flex w-full justify-between gap-6">
                    <span>{config[name as keyof typeof config]?.label}</span>
                    <span className="tabular-nums">
                      {currency.format(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Bar
            dataKey="revenue"
            fill="var(--color-revenue)"
            maxBarSize={14}
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          />
          <Bar
            dataKey="expense"
            fill="var(--color-expense)"
            maxBarSize={14}
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export function TransactionActivityChartSkeleton() {
  const { t } = useTranslation('journal-entries');
  const loading_label = t('activity_loading_label');

  return (
    <div aria-busy="true" className="flex min-w-0 flex-col gap-5">
      <output className="sr-only">{loading_label}</output>
      <Skeleton className="h-80 w-full sm:h-96" />
    </div>
  );
}

export function TransactionActivityChartError() {
  const { t } = useTranslation('journal-entries');
  const error_title = t('activity_error_title');
  const error_description = t('overview_error_description');

  return (
    <Alert variant="destructive">
      <AlertTitle>{error_title}</AlertTitle>
      <AlertDescription>{error_description}</AlertDescription>
    </Alert>
  );
}

export function TransactionActivityChartWithState({
  state,
  days,
  currencyCode,
}: Readonly<TransactionActivityChartWithStateProps>) {
  return (
    <WithTransitionState
      state={state}
      data={{ days, currencyCode }}
      loading={<TransactionActivityChartSkeleton />}
      error={<TransactionActivityChartError />}
    >
      {(data) =>
        data.days && data.currencyCode ? (
          <TransactionActivityChart
            days={data.days}
            currencyCode={data.currencyCode}
          />
        ) : (
          <TransactionActivityChartError />
        )
      }
    </WithTransitionState>
  );
}
