import { Card, CardContent } from '@/shared/components/card';
import { Money } from '@/shared/components/money';
import { cn } from '@/shared/lib/utils/cn';
import { ArrowDownLeft, ArrowUpRight, Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import categoriesHelpers from '../helper';
import type { CategorySummaryProps } from '../types';
import { CategoryHelp } from './category-help';

export function CategorySummary({ summary }: Readonly<CategorySummaryProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';

  const cards = [
    {
      title: t('categories_revenue_label'),
      icon: ArrowUpRight,
      iconColor: 'text-success',
      section: summary.revenue,
    },
    {
      title: t('categories_expenses_label'),
      icon: ArrowDownLeft,
      iconColor: 'text-destructive',
      section: summary.expenses,
    },
  ];

  const uncategorized_label = t('categories_uncategorized_label');
  const reporting_help_label = t('categories_reporting_help_label');

  const transactions_text = t('categories_transaction_count', {
    count: summary.suspense.transactionCount,
  });

  const period_text = categoriesHelpers.formatPeriod(summary.period, locale);

  const comparison_text = t('categories_comparison_description', {
    period: categoriesHelpers.formatPeriod(summary.comparisonPeriod, locale),
  });

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center gap-1">
        <p className="text-xs text-muted-foreground">{period_text}</p>
        <CategoryHelp label={reporting_help_label}>
          <p>{comparison_text}</p>
        </CategoryHelp>
      </div>
      <Card size="sm">
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3">
            {cards.map(({ title, icon: Icon, iconColor, section }) => (
              <section
                key={title}
                aria-label={title}
                className="flex min-w-0 flex-col gap-3 py-1 pl-4 first:border-r first:border-border/50 first:pr-4 first:pl-0 md:px-5"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon aria-hidden className={cn('size-4', iconColor)} />
                  <h3 className="text-sm font-medium">{title}</h3>
                </div>
                <Money
                  value={section.total}
                  className="text-2xl font-semibold tracking-tight tabular-nums break-all md:text-3xl"
                />
                <p className="text-xs text-muted-foreground">
                  {section.percentageChange === null
                    ? t('categories_no_comparison_text')
                    : t('categories_change_text', {
                        change: categoriesHelpers.formatPercentage(
                          section.percentageChange,
                          locale,
                          true
                        ),
                      })}
                </p>
              </section>
            ))}
            <section
              aria-label={uncategorized_label}
              className="col-span-2 mt-4 grid min-w-0 grid-cols-2 items-center gap-2 border-t border-border/50 pt-4 md:col-span-1 md:mt-0 md:flex md:flex-col md:items-start md:gap-3 md:border-t-0 md:border-l md:py-1 md:pl-5"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tags aria-hidden className="size-4" />
                <h3 className="text-sm font-medium">{uncategorized_label}</h3>
              </div>
              <Money
                value={summary.suspense.amount}
                className="min-w-0 max-w-full text-right text-2xl font-semibold tracking-tight tabular-nums break-all md:text-left md:text-3xl"
              />
              <p className="text-xs text-muted-foreground">
                {transactions_text}
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
