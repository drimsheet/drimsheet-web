import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/chart';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/empty';
import { Money } from '@/shared/components/money';
import { Skeleton } from '@/shared/components/skeleton';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import { parseISO } from 'date-fns';
import { ChartNoAxesCombined } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import type { CategoryPartWithStateProps, CategoryTrendProps } from '../types';
import { CategoryDetailsError } from './section-error';

export function CategoryTrend({
  months,
  hasTransactions = false,
  currencyCode,
  type,
}: Readonly<CategoryTrendProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';

  const dateFormat = new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: '2-digit',
  });

  const data = months.map((month) => ({
    ...month,
    label: dateFormat.format(parseISO(`${month.month}-01`)),
  }));

  const title = t(
    type === 'revenue'
      ? 'category_details_revenue_trend_title'
      : 'category_details_expense_trend_title'
  );

  const empty_text = t(
    hasTransactions
      ? 'category_details_zero_net_text'
      : 'category_details_trend_empty_text'
  );

  const amount_label = t('details_amount_label');

  const empty_description = t(
    hasTransactions
      ? 'category_details_zero_net_description'
      : 'category_details_trend_empty_description'
  );

  const hasActivity = months.some(({ amount }) => amount !== 0);

  return (
    <div className="min-w-0">
      {!hasActivity && (
        <Empty className="min-h-56 px-4 py-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartNoAxesCombined aria-hidden />
            </EmptyMedia>
            <EmptyTitle>{empty_text}</EmptyTitle>
            <EmptyDescription>{empty_description}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {hasActivity && (
        <ChartContainer
          config={{
            amount: {
              label: amount_label,
              color:
                type === 'revenue'
                  ? 'var(--financial-income)'
                  : 'var(--financial-expense)',
            },
          }}
          className="h-56 w-full"
          aria-label={title}
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={12}
            />
            <YAxis
              width="auto"
              tickSize={0}
              tickMargin={8}
              tickLine={false}
              axisLine={false}
              tick={({ x, y, payload }) => (
                <foreignObject
                  x={0}
                  y={Number(y) - 8}
                  width={Number(x)}
                  height={16}
                  overflow="visible"
                >
                  <Money
                    value={{
                      amount: Number(payload.value),
                      currencyCode,
                      isMinorUnit: false,
                    }}
                    notation="compact"
                    currencyDisplay="narrowSymbol"
                    maximumFractionDigits={1}
                    className="recharts-cartesian-axis-tick-value inline-block w-max text-xs leading-4 whitespace-nowrap text-muted-foreground tabular-nums"
                  />
                </foreignObject>
              )}
            />
            <ReferenceLine y={0} stroke="var(--border)" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => (
                    <Money
                      value={{
                        amount: Number(value),
                        currencyCode,
                        isMinorUnit: false,
                      }}
                      className="tabular-nums"
                    />
                  )}
                />
              }
            />
            <Bar
              dataKey="amount"
              fill="var(--color-amount)"
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}

export function CategoryTrendSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_transactions_chart');

  return (
    <div aria-busy="true" className="min-w-0">
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <Skeleton className="h-56 w-full" />
    </div>
  );
}

export function CategoryTrendWithState({
  loading,
  error,
  children,
}: Readonly<CategoryPartWithStateProps>) {
  let state: 'loading' | 'error' | 'success' = 'success';
  if (loading) {
    state = 'loading';
  } else if (error) {
    state = 'error';
  }

  return (
    <WithTransitionState
      state={state}
      data={true}
      loading={<CategoryTrendSkeleton />}
      error={<CategoryDetailsError />}
    >
      {() => children}
    </WithTransitionState>
  );
}
