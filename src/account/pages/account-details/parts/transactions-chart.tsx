import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type TChartConfig,
} from '@/shared/components/chart';
import { Money } from '@/shared/components/money';
import { Skeleton } from '@/shared/components/skeleton';
import { currencyService } from '@/shared/lib/services/currency.service';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import accountDetailsHelpers from '../helper';
import type { TransactionsChartProps } from '../types';

export function TransactionsChart({
  cashFlow,
}: Readonly<TransactionsChartProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');

  const locale =
    i18n.resolvedLanguage === 'en' ? 'en-GB' : i18n.resolvedLanguage;

  const data = accountDetailsHelpers.chartData(cashFlow, locale ?? 'en-GB');
  const moneyIn = accountDetailsHelpers.toMajorUnits(cashFlow.totalMoneyIn);
  const moneyOut = accountDetailsHelpers.toMajorUnits(cashFlow.totalMoneyOut);

  const compact = new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  const currency = new Intl.NumberFormat(
    currencyService.getJurisdictionLocale(cashFlow.currencyCode),
    {
      style: 'currency',
      currency: cashFlow.currencyCode,
      trailingZeroDisplay: 'stripIfInteger',
    }
  );

  const hasActivity =
    moneyIn !== 0 ||
    moneyOut !== 0 ||
    data.some((bucket) => bucket.moneyIn !== 0 || bucket.moneyOut !== 0);

  const config = {
    moneyIn: {
      label: t('details_money_in_label'),
      color: 'var(--financial-income)',
    },
    moneyOut: {
      label: t('details_money_out_label'),
      color: 'var(--financial-expense)',
    },
  } satisfies TChartConfig;

  const total_in_label = t('details_total_in_label');
  const total_out_label = t('details_total_out_label');
  const date_label = t('details_date_label');
  const chart_label = t('details_chart_aria_label');

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <dl className="flex flex-wrap gap-x-12 gap-y-5">
        <div className="flex flex-col gap-2">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <span aria-hidden className="size-3 bg-financial-income" />
            {total_in_label}
          </dt>
          <dd>
            <Money
              value={cashFlow.totalMoneyIn}
              className="text-2xl tabular-nums"
            />
          </dd>
        </div>
        <div className="flex flex-col gap-2">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <span aria-hidden className="size-3 bg-financial-expense" />
            {total_out_label}
          </dt>
          <dd>
            <Money
              value={cashFlow.totalMoneyOut}
              className="text-2xl tabular-nums"
            />
          </dd>
        </div>
      </dl>
      <div className="relative min-w-0">
        <p className="text-xs text-muted-foreground">{cashFlow.currencyCode}</p>
        <ChartContainer
          config={config}
          className="h-64 w-full aspect-auto"
          role="region"
          aria-label={chart_label}
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 8, left: 0, right: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={20}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              domain={
                hasActivity
                  ? [
                      (minimum: number) => Math.min(0, minimum),
                      (maximum: number) => Math.max(0, maximum),
                    ]
                  : [0, 1]
              }
              ticks={hasActivity ? undefined : [0, 0.25, 0.5, 0.75, 1]}
              tickFormatter={(value: number) =>
                hasActivity || value === 0 ? compact.format(value) : ''
              }
            />
            <ReferenceLine y={0} stroke="var(--muted-foreground)" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.range}
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
              dataKey="moneyIn"
              fill="var(--color-moneyIn)"
              maxBarSize={40}
              isAnimationActive={false}
            />
            <Bar
              dataKey="moneyOut"
              fill="var(--color-moneyOut)"
              maxBarSize={40}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
        <p className="text-right text-xs text-muted-foreground">{date_label}</p>
      </div>
    </div>
  );
}

export function TransactionsChartSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_transactions_chart');

  return (
    <div aria-busy="true">
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-x-12 gap-y-5">
          <Skeleton className="h-16 w-36" />
          <Skeleton className="h-16 w-36" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
