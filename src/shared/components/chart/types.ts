import type * as React from 'react';
import type * as RechartsPrimitive from 'recharts';
import type { TooltipValueType } from 'recharts';
export type UTooltipNameType = number | string;

export type TChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<'light' | 'dark', string> }
  )
>;

export type ChartContextProps = {
  config: TChartConfig;
};

export type ChartContainerProps = React.ComponentProps<'div'> & {
  config: TChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children'];
  initialDimension?: {
    width: number;
    height: number;
  };
};

export type ChartTooltipContentProps = React.ComponentProps<
  typeof RechartsPrimitive.Tooltip
> &
  React.ComponentProps<'div'> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    nameKey?: string;
    labelKey?: string;
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<
      TooltipValueType,
      UTooltipNameType
    >,
    'accessibilityLayer'
  >;
