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
import { WithTransitionState } from '@/shared/components/with-transition-state';
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
import { BalanceTrendError } from './error';
import balanceTrendHelpers from './helper';
import { BalanceTrendSkeleton } from './skeleton';
import type { BalanceTrendProps, BalanceTrendWithStateProps } from './types';

export function BalanceTrend({ points, labels }: Readonly<BalanceTrendProps>) {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'en';
  const data = balanceTrendHelpers.chartData(points, locale);
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
    amount: {
      label: labels.balanceLabel,
      color: 'var(--secondary)',
    },
  } satisfies TChartConfig;

  const empty_title = noHistory ? labels.emptyTitle : labels.inactiveTitle;

  if (noHistory || !hasActivity) {
    return (
      <Empty className="px-4 py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChartNoAxesCombined aria-hidden />
          </EmptyMedia>
          <EmptyTitle>{empty_title}</EmptyTitle>
          <EmptyDescription>{labels.emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ChartContainer
        config={config}
        className="aspect-auto h-56 w-full"
        aria-label={labels.chartLabel}
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
                  balanceTrendHelpers.formatDate(
                    payload[0].payload.date,
                    locale
                  )
                }
                formatter={(_, __, item) => (
                  <div className="flex justify-between gap-6">
                    <span>{labels.balanceLabel}</span>
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
          {labels.dataLabel}
        </summary>
        <dl aria-label={labels.dataLabel} className="flex flex-col gap-2 py-3">
          {points.map((point) => (
            <div
              key={point.date}
              className="flex flex-wrap justify-between gap-3"
            >
              <dt aria-label={labels.dateLabel}>
                {balanceTrendHelpers.formatDate(point.date, locale)}
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

export function BalanceTrendWithState({
  state = 'success',
  labels,
  points,
}: Readonly<BalanceTrendWithStateProps>) {
  return (
    <WithTransitionState
      state={state}
      data={{ points }}
      loading={<BalanceTrendSkeleton label={labels.loadingLabel} />}
      error={
        <BalanceTrendError
          title={labels.errorTitle}
          description={labels.errorDescription}
        />
      }
    >
      {(data) => {
        if (data.points == null) {
          return (
            <BalanceTrendError
              title={labels.errorTitle}
              description={labels.errorDescription}
            />
          );
        }

        return <BalanceTrend points={data.points} labels={labels} />;
      }}
    </WithTransitionState>
  );
}
