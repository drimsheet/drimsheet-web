import { useTranslation } from 'react-i18next';
import { useCategorySummary } from '../hooks/use-categories';
import type { CategoryOverviewProps } from '../types';
import { CategoryChart } from './category-chart';
import { CategorySummary } from './category-summary';
import { CategorySectionError } from './section-error';
import { CategoriesSkeleton } from './skeleton';

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
    <div className="flex flex-col gap-10 md:gap-14">
      {summary.isPending && <CategoriesSkeleton />}
      {summary.isError && (
        <CategorySectionError
          title={overview_title}
          onRetry={() => void summary.refetch()}
        />
      )}
      {summary.isSuccess && (
        <>
          <CategorySummary summary={summary.data} />
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-x-16">
            <CategoryChart
              title={revenue_title}
              description={revenue_description}
              section={summary.data.revenue}
              onViewAccount={onViewAccount}
            />
            <CategoryChart
              title={expenses_title}
              description={expenses_description}
              section={summary.data.expenses}
              onViewAccount={onViewAccount}
            />
          </div>
        </>
      )}
    </div>
  );
}
