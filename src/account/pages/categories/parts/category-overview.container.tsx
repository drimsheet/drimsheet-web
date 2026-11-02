import { useCategorySummary } from '@/account/hooks/use-category-summary';
import { useTranslation } from 'react-i18next';
import categoriesHelpers from '../helper';
import { CategorySummary, CategorySummarySkeleton } from './category-summary';
import { CategorySectionError } from './section-error';

export function CategoryOverviewContainer() {
  const { t } = useTranslation('ledger-accounts');
  const summary = useCategorySummary();
  const totals = summary.data ? categoriesHelpers.totals(summary.data) : null;
  const overview_title = t('categories_overview_title');
  const empty_text = t('categories_totals_empty_text');

  return (
    <>
      {summary.isPending && <CategorySummarySkeleton />}
      {summary.isError && <CategorySectionError title={overview_title} />}
      {summary.isSuccess && totals && <CategorySummary summary={totals} />}
      {summary.isSuccess && !totals && (
        <p className="text-sm text-muted-foreground">{empty_text}</p>
      )}
    </>
  );
}
