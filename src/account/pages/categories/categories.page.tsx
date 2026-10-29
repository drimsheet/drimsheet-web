import { CategoryEditorDialog } from '@/account/dialogs/category-editor';
import { useCategoryAccounts } from '@/account/hooks/use-category-accounts';
import { categoryService } from '@/account/lib/services/category.service';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { Button } from '@/shared/components/button';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useTableQueryParams } from '@/shared/hooks/use-table-query-params';
import type { IRevenueExpenseAndSuspenseAccountBalanceDto } from '@/shared/lib/api/Api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import categoriesHelpers from './helper';
import { CategoryArchiveConfirmation } from './parts/archive-confirmation';
import { CategoryOverviewContainer } from './parts/category-overview.container';
import { CategoryPeriod } from './parts/category-period';
import { CategoryTable } from './parts/category-table';
import { CategorySectionError } from './parts/section-error';
import type { UCategoryTypeFilter } from './types';

export function CategoriesPage() {
  const { t, i18n } = useTranslation(['ledger-accounts', 'shared']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [now] = useState(() => new Date());

  const periods = categoriesHelpers.periodOptions(
    now,
    i18n.resolvedLanguage ?? 'en'
  );

  const [period, setPeriod] = useState(periods[0].value);

  const [editor, setEditor] =
    useState<IRevenueExpenseAndSuspenseAccountBalanceDto | null>(null);

  const [archiveAccount, setArchiveAccount] =
    useState<IRevenueExpenseAndSuspenseAccountBalanceDto | null>(null);

  const table = useTableQueryParams<string, 'type'>({ filterKeys: ['type'] });
  const search = useDebounce(table.searchQuery, 300);
  const filter = table.filters.type?.[0];

  const type: UCategoryTypeFilter =
    filter === 'revenue' || filter === 'expense' ? filter : 'all';

  const accounts = useCategoryAccounts({
    page: Math.max(1, table.page),
    limit: 10,
    search: search || undefined,
    type: type === 'all' ? undefined : type,
  });

  const archive = useMutation({
    mutationFn: categoryService.archive,
    retry: false,
  });

  const handleViewAccount = (id: string) => {
    const account = accounts.data?.data.find((item) => item.accountId === id);

    const isSuspense =
      account && account.type !== 'revenue' && account.type !== 'expense';

    navigate(
      isSuspense
        ? `/transactions?accountId=${encodeURIComponent(id)}`
        : `/categories/${encodeURIComponent(id)}`
    );
  };

  const handleTypeChange = (value: string) => {
    table.handleFilterChange({ type: value === 'all' ? [] : [value] });
  };

  const handleArchiveSelected = (
    account: IRevenueExpenseAndSuspenseAccountBalanceDto
  ) => {
    archive.reset();
    setArchiveAccount(account);
  };

  const handleArchive = async () => {
    if (!archiveAccount) {
      return;
    }

    try {
      await archive.mutateAsync(archiveAccount.accountId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categoryService'] }),
        queryClient.invalidateQueries({ queryKey: ['ledgerReportingService'] }),
      ]);
      setArchiveAccount(null);
    } catch {
      // The confirmation retains the account and displays its translated error.
    }
  };

  const title = t('shared:categories');
  const add_label = t('ledger-accounts:categories_add_label');
  const table_title = t('ledger-accounts:categories_table_title');
  const overview_title = t('ledger-accounts:categories_overview_title');

  return (
    <>
      <AppBody
        title={title}
        actionsSlot={
          <Button onClick={() => navigate('/categories/new')}>
            <Plus data-icon="inline-start" />
            {add_label}
          </Button>
        }
      >
        <div className="flex min-w-0 flex-col">
          <AppSection title={overview_title}>
            <div className="flex flex-wrap justify-end">
              <CategoryPeriod
                period={period}
                periods={periods}
                onPeriodChange={setPeriod}
              />
            </div>
            <CategoryOverviewContainer
              query={categoriesHelpers.periodQuery(period, now)}
              onViewAccount={handleViewAccount}
            />
          </AppSection>
          {accounts.isError && <CategorySectionError title={table_title} />}
          <CategoryTable
            accounts={accounts.data}
            loading={accounts.isPending}
            search={table.searchQuery}
            type={type}
            onSearchChange={table.handleSearchChange}
            onTypeChange={handleTypeChange}
            onPageChange={table.handlePageChange}
            onViewAccount={handleViewAccount}
            onEditAccount={setEditor}
            onArchiveAccount={handleArchiveSelected}
          />
          {editor !== null && (
            <CategoryEditorDialog
              account={editor}
              onClose={() => setEditor(null)}
            />
          )}
          <CategoryArchiveConfirmation
            account={archiveAccount}
            pending={archive.isPending}
            error={archive.isError}
            onClose={() => setArchiveAccount(null)}
            onConfirm={() => void handleArchive()}
          />
        </div>
      </AppBody>
    </>
  );
}
