import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type TChartConfig,
} from '@/shared/components/chart';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/empty';
import { Money } from '@/shared/components/money';
import { currencyService } from '@/shared/lib/services/currency.service';
import { ChartNoAxesCombined } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import dashboardHelpers from '../helper';
import type { BalanceTrendProps } from '../types';

export function BalanceTrend({ points }: Readonly<BalanceTrendProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';
  const data = dashboardHelpers.chartData(points, locale);
  const noHistory = points.length < 2;
  const hasActivity = data.some((point) => point.amount !== 0);
  const currencyCode = points[0]?.amount.currencyCode ?? 'NGN';

  const currency = new Intl.NumberFormat(
    currencyService.getJurisdictionLocale(currencyCode),
    {
      style: 'currency',
      currency: currencyCode,
      notation: 'compact',
      maximumFractionDigits: 1,
    }
  );

  const config = {
    amount: { label: t('dashboard_balance_label'), color: 'var(--secondary)' },
  } satisfies TChartConfig;

  const chart_label = t('dashboard_history_title');

  const empty_title = t(
    noHistory
      ? 'dashboard_history_empty_title'
      : 'dashboard_activity_empty_title'
  );

  const empty_description = t('dashboard_history_empty_description');
  const data_label = t('dashboard_chart_data_label');
  const date_label = t('dashboard_date_label');
  const balance_label = t('dashboard_balance_label');

  if (noHistory || !hasActivity) {
    return (
      <Empty className="px-4 py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChartNoAxesCombined aria-hidden />
          </EmptyMedia>
          <EmptyTitle>{empty_title}</EmptyTitle>
          <EmptyDescription>{empty_description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ChartContainer
        config={config}
        className="aspect-auto h-56 w-full"
        aria-label={chart_label}
      >
        <LineChart
          accessibilityLayer
          data={data}
          margin={{ top: 12, left: 0, right: 16, bottom: 0 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            minTickGap={32}
            tickMargin={10}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={68}
            domain={[
              (min: number) => Math.min(0, min),
              (max: number) => Math.max(0, max),
            ]}
            tickFormatter={(value: number) => currency.format(value)}
          />
          <ReferenceLine y={0} stroke="var(--border)" />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.date &&
                  dashboardHelpers.formatDate(payload[0].payload.date, locale)
                }
                formatter={(_, __, item) => (
                  <div className="flex justify-between gap-6">
                    <span>{balance_label}</span>
                    <Money
                      value={item.payload.money}
                      className="tabular-nums"
                    />
                  </div>
                )}
              />
            }
          />
          <Line
            type="linear"
            dataKey="amount"
            stroke="var(--color-amount)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
      <details className="text-xs text-muted-foreground">
        <summary className="w-fit rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
          {data_label}
        </summary>
        <dl aria-label={data_label} className="flex flex-col gap-2 py-3">
          {points.map((point) => (
            <div
              key={point.date}
              className="flex flex-wrap justify-between gap-3"
            >
              <dt aria-label={date_label}>
                {dashboardHelpers.formatDate(point.date, locale)}
              </dt>
              <dd>
                <Money value={point.amount} />
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
