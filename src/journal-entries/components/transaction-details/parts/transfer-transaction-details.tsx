import type { TransferTransactionDetailsProps } from '@/journal-entries/components/transaction-details/types';
import { Money } from '@/shared/components/money';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TransferTransactionDetails({
  details,
}: Readonly<TransferTransactionDetailsProps>) {
  const { t } = useTranslation('journal-entries');

  const accountsTitle = t('transaction_details_accounts_title');
  const fromLabel = t('transaction_details_from_label');
  const toLabel = t('transaction_details_to_label');
  const conversionTitle = t('transaction_details_conversion_title');
  const exchangeRateLabel = t('exchange_rate_label');
  const transferFeeTitle = t('transaction_details_transfer_fee_title');

  const hasConversion =
    details.sourceAmount.currencyCode !==
    details.destinationAmount.currencyCode;

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
          {accountsTitle}
        </h3>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <div className="min-w-0 rounded-lg bg-muted/40 p-3">
            <div className="mb-1 text-xs text-muted-foreground">
              {fromLabel}
            </div>
            <div className="truncate text-sm font-semibold">
              {details.sourceAccountName}
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-1 text-xs text-muted-foreground tabular-nums">
              <Money value={details.sourceAmount} />
              <span>{details.sourceAmount.currencyCode}</span>
            </div>
          </div>

          <ArrowRight
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />

          <div className="min-w-0 rounded-lg bg-muted/40 p-3">
            <div className="mb-1 text-xs text-muted-foreground">{toLabel}</div>
            <div className="truncate text-sm font-semibold">
              {details.destinationAccountName}
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-1 text-xs text-muted-foreground tabular-nums">
              <Money value={details.destinationAmount} />
              <span>{details.destinationAmount.currencyCode}</span>
            </div>
          </div>
        </div>
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

      {details.fees.length > 0 && (
        <section className="border-t border-border py-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {transferFeeTitle}
          </h3>
          <ul className="space-y-2">
            {details.fees.map((fee) => (
              <li
                className="flex items-start justify-between gap-4 rounded-lg bg-muted/40 p-3"
                key={fee.id}
              >
                <span className="min-w-0 text-sm">
                  <span className="block font-medium">{fee.accountName}</span>
                  {fee.description && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {fee.description}
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-baseline gap-1 text-sm font-semibold tabular-nums">
                  <Money value={fee.amount} />
                  <span className="text-xs font-medium text-muted-foreground">
                    {fee.amount.currencyCode}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
