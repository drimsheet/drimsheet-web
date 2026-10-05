import type { CashTransactionDetailsProps } from '@/journal-entries/components/transaction-details/types';
import { Money } from '@/shared/components/money';
import { EJournalEntrySourceType } from '@/shared/lib/api/Api';
import { useTranslation } from 'react-i18next';

export function CashTransactionDetails({
  details,
}: Readonly<CashTransactionDetailsProps>) {
  const { t } = useTranslation('journal-entries');
  const isInflow = details.direction === EJournalEntrySourceType.Receipt;

  const counterpartyNames = details.counterparties
    .map((counterparty) => counterparty.name)
    .join(', ');

  const cashAccountLabel = isInflow
    ? t('transaction_details_received_into_label')
    : t('transaction_details_paid_from_label');

  const counterpartyLabel = isInflow
    ? t('transaction_details_received_from_label')
    : t('transaction_details_paid_to_label');

  const transactionSectionTitle = t(
    'transaction_details_transaction_section_title'
  );

  const cashAccountText = t('transaction_details_cash_account_text');
  const whatForTitle = t('transaction_details_what_for_title');
  const conversionTitle = t('transaction_details_conversion_title');
  const exchangeRateLabel = t('exchange_rate_label');

  const hasConversion =
    details.amount.currencyCode !== details.functionalAmount.currencyCode;

  const exchangeRateValue =
    details.exchangeRate && hasConversion
      ? t('transaction_details_exchange_rate_value', {
          baseCurrency: details.exchangeRate.baseCurrencyCode,
          rate: new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 8,
          }).format(details.exchangeRate.rate),
          targetCurrency: details.exchangeRate.targetCurrencyCode,
        })
      : undefined;

  return (
    <>
      <section className="border-t border-border py-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {transactionSectionTitle}
        </h3>
        <dl className="space-y-4">
          <div className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.35fr)] gap-4">
            <dt className="text-xs text-muted-foreground">
              {cashAccountLabel}
            </dt>
            <dd className="text-right text-sm font-medium">
              {details.cashAccountName}
              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                {cashAccountText}
              </span>
            </dd>
          </div>

          {counterpartyNames && (
            <div className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.35fr)] gap-4">
              <dt className="text-xs text-muted-foreground">
                {counterpartyLabel}
              </dt>
              <dd className="text-right text-sm font-medium">
                {counterpartyNames}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="border-t border-border py-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {whatForTitle}
        </h3>
        <ul className="space-y-2">
          {details.categories.map((category) => (
            <li
              className="flex items-start justify-between gap-4 rounded-lg bg-muted/40 p-3"
              key={category.id}
            >
              <span className="min-w-0 text-sm">
                <span className="block font-medium">
                  {category.accountName}
                </span>
                {category.description && (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {category.description}
                  </span>
                )}
              </span>
              <span className="flex shrink-0 items-baseline gap-1 text-sm font-semibold tabular-nums">
                <Money value={category.amount} />
                <span className="text-xs font-medium text-muted-foreground">
                  {category.amount.currencyCode}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {exchangeRateValue && (
        <section className="border-t border-border py-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {conversionTitle}
          </h3>
          <dl>
            <div className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.35fr)] gap-4">
              <dt className="text-xs text-muted-foreground">
                {exchangeRateLabel}
              </dt>
              <dd className="text-right text-sm font-medium tabular-nums">
                {exchangeRateValue}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </>
  );
}
