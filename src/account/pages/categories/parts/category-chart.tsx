import { Empty, EmptyHeader, EmptyTitle } from '@/shared/components/empty';
import { Money } from '@/shared/components/money';
import { cn } from '@/shared/lib/utils/cn';
import { useTranslation } from 'react-i18next';
import categoriesHelpers from '../helper';
import type { CategoryChartProps } from '../types';

export function CategoryChart({
  title,
  description,
  section,
  onViewAccount,
}: Readonly<CategoryChartProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';
  const rows = categoriesHelpers.chartRows(section.accounts);
  const empty_text = t('categories_chart_empty_text');

  return (
    <section
      aria-label={title}
      tabIndex={0}
      className="max-h-[400px] min-w-0 overflow-y-auto overscroll-contain rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
    >
      <div className="sticky top-0 z-1 flex flex-col gap-2 bg-background pb-7">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {rows.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{empty_text}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
      <ul className="flex flex-col gap-6 pr-4 pb-4">
        {rows.map(({ account, left, width, zero, negative }) => (
          <li key={account.accountId}>
            <button
              type="button"
              onClick={() => onViewAccount(account.accountId)}
              className="flex w-full flex-col gap-3 rounded-sm py-1 text-left focus-visible:outline-2 focus-visible:outline-ring hover:bg-muted/40"
            >
              <span className="flex w-full flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-sm">
                <span className="min-w-0 break-words font-medium">
                  {account.accountName}
                </span>
                <span className="flex flex-wrap gap-x-4 gap-y-2 tabular-nums">
                  <Money value={account.amount} />
                  <span className="text-muted-foreground">
                    {categoriesHelpers.formatPercentage(
                      account.sharePercentage,
                      locale
                    )}
                  </span>
                </span>
              </span>
              <span aria-hidden className="relative block h-3 w-full">
                <span
                  className="absolute inset-y-0 w-px bg-border"
                  style={{ left: `${zero}%` }}
                />
                <span
                  className={cn(
                    'absolute inset-y-0 rounded-sm bg-primary/70',
                    negative && 'bg-muted-foreground'
                  )}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
