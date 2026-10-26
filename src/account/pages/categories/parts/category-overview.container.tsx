import { useCategorySummary } from '@/account/hooks/use-category-summary';
import { useTranslation } from 'react-i18next';
import type { CategoryOverviewProps } from '../types';
import { CategoryChart, CategoryChartSkeleton } from './category-chart';
import { CategorySummary, CategorySummarySkeleton } from './category-summary';
import { CategorySectionError } from './section-error';

export function CategoryOverviewContainer({
  query,
  onViewAccount,
}: Readonly<CategoryOverviewProps>) {
  const { t } = useTranslation('ledger-accounts');
  const summary = useCategorySummary(query);
  const revenue_title = t('categories_revenue_chart_title');
  const expenses_title = t('categories_expenses_chart_title');
  const revenue_description = t('categories_revenue_chart_description');
  const expenses_description = t('categories_expenses_chart_description');
  const overview_title = t('categories_overview_title');

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {summary.isPending && (
        <>
          <CategorySummarySkeleton />
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <CategoryChartSkeleton title={revenue_title} />
            <CategoryChartSkeleton title={expenses_title} />
          </div>
        </>
      )}
      {summary.isError && <CategorySectionError title={overview_title} />}
      {summary.isSuccess && (
        <>
          <CategorySummary summary={summary.data} />
          <div className="grid min-w-0 items-start gap-4 lg:grid-cols-2">
            <CategoryChart
              title={revenue_title}
              description={revenue_description}
              type="revenue"
              section={summary.data.revenue}
              onViewAccount={onViewAccount}
            />
            <CategoryChart
              title={expenses_title}
              description={expenses_description}
              type="expense"
              section={summary.data.expenses}
              onViewAccount={onViewAccount}
            />
          </div>
        </>
      )}
    </div>
  );
}
