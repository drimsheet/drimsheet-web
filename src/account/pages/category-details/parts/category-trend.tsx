import { AppSection } from '@/shared/components/app-section';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/chart';
import { Empty, EmptyHeader, EmptyTitle } from '@/shared/components/empty';
import { Skeleton } from '@/shared/components/skeleton';
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
import type { CategoryTrendProps } from '../types';

export function CategoryTrend({
  months,
  currencyCode,
  type,
}: Readonly<CategoryTrendProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';

  const dateFormat = new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: '2-digit',
  });

  const moneyFormat = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  });

  const compact = new Intl.NumberFormat(locale, { notation: 'compact' });

  const data = months.map((month) => ({
    ...month,
    label: dateFormat.format(parseISO(`${month.month}-01`)),
  }));

  const title = t(
    type === 'revenue'
      ? 'category_details_revenue_trend_title'
      : 'category_details_expense_trend_title'
  );

  const description = t('category_details_trend_description', {
    currency: currencyCode,
  });

  const empty_text = t('category_details_trend_empty_text');
  const amount_label = t('details_amount_label');
  const hasActivity = months.some(({ amount }) => amount !== 0);

  return (
    <AppSection
      title={title}
      className="min-w-0"
      role="region"
      aria-label={title}
    >
      <p className="text-sm text-muted-foreground">{description}</p>

      <div>
        {!hasActivity && (
          <Empty className="min-h-56">
            <EmptyHeader>
              <EmptyTitle>{empty_text}</EmptyTitle>
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
                width={56}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => compact.format(value)}
              />
              <ReferenceLine y={0} stroke="var(--border)" />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => moneyFormat.format(Number(value))}
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
    </AppSection>
  );
}

export function CategoryTrendSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_transactions_chart');

  return (
    <AppSection aria-busy="true" className="min-w-0">
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-5 w-full max-w-64" />
      <Skeleton className="h-56 w-full" />
    </AppSection>
  );
}
