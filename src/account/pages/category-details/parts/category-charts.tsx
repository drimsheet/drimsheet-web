import { WithTransitionState } from '@/shared/components/with-transition-state';
import type {
  CategoryChartsProps,
  CategoryChartsWithStateProps,
} from '../types';
import { CategoryTrendSkeleton } from './category-trend';
import { CounterpartyShareSkeleton } from './counterparty-share';

export function CategoryCharts({ children }: Readonly<CategoryChartsProps>) {
  return (
    <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      {children}
    </div>
  );
}

export function CategoryChartsSkeleton() {
  return (
    <CategoryCharts>
      <CategoryTrendSkeleton />
      <CounterpartyShareSkeleton />
    </CategoryCharts>
  );
}

export function CategoryChartsWithState({
  loading,
  children,
}: Readonly<CategoryChartsWithStateProps>) {
  return (
    <WithTransitionState
      state={loading ? 'loading' : 'success'}
      data={true}
      loading={<CategoryChartsSkeleton />}
      error={null}
    >
      {() => <CategoryCharts>{children}</CategoryCharts>}
    </WithTransitionState>
  );
}
