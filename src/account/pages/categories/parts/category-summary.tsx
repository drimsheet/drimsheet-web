import { BalanceEffectIcon } from '@/shared/components/balance-effect-icon';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/card';
import { Money } from '@/shared/components/money';
import { ELedgerAccountBalanceEffect } from '@/shared/lib/api/Api';
import { Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import categoriesHelpers from '../helper';
import type { CategorySummaryProps } from '../types';

export function CategorySummary({ summary }: Readonly<CategorySummaryProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';

  const cards = [
    {
      title: t('categories_revenue_label'),
      effect: ELedgerAccountBalanceEffect.Increase,
      section: summary.revenue,
    },
    {
      title: t('categories_expenses_label'),
      effect: ELedgerAccountBalanceEffect.Decrease,
      section: summary.expenses,
    },
  ];

  const uncategorized_label = t('categories_uncategorized_label');

  const transactions_text = t('categories_transaction_count', {
    count: summary.suspense.transactionCount,
  });

  const period_text = categoriesHelpers.formatPeriod(summary.period, locale);

  const comparison_text = t('categories_comparison_description', {
    period: categoriesHelpers.formatPeriod(summary.comparisonPeriod, locale),
  });

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <p className="text-sm text-muted-foreground">{period_text}</p>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map(({ title, effect, section }) => (
          <Card
            key={title}
            className="gap-6 py-8 bg-muted/50 shadow-none ring-0 border-0"
            role="region"
            aria-label={title}
          >
            <CardHeader className="px-6 xl:px-8">
              <CardTitle>{title}</CardTitle>
              <CardAction>
                <BalanceEffectIcon
                  effect={effect}
                  aria-hidden
                  className="size-10 [&_svg]:size-5"
                />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-6 xl:px-8">
              <Money
                value={section.total}
                className="text-2xl font-medium tabular-nums break-all"
              />
              <CardDescription>
                {section.percentageChange === null
                  ? t('categories_no_comparison_text')
                  : t('categories_change_text', {
                      change: categoriesHelpers.formatPercentage(
                        section.percentageChange,
                        locale,
                        true
                      ),
                    })}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
        <Card
          className="gap-6 py-8 bg-muted/50 shadow-none ring-0 border-0"
          role="region"
          aria-label={uncategorized_label}
        >
          <CardHeader className="px-6 xl:px-8">
            <CardTitle>{uncategorized_label}</CardTitle>
            <CardAction>
              <Tags aria-hidden className="size-5 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-6 xl:px-8">
            <p className="text-2xl font-medium tabular-nums">
              {transactions_text}
            </p>
            <CardDescription>
              <Money value={summary.suspense.amount} />
            </CardDescription>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">{comparison_text}</p>
    </div>
  );
}
