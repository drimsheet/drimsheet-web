import { BalanceEffectIcon } from '@/shared/components/balance-effect-icon';
import { FormattedDate } from '@/shared/components/date';
import { ItemMedia } from '@/shared/components/item';
import { Money } from '@/shared/components/money';
import {
  EJournalEntrySourceType,
  ELedgerAccountBalanceEffect,
  type IMoneyDto,
} from '@/shared/lib/api/Api';
import { ArrowLeftRight, Paperclip } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import transactionDetailsHelpers from './helper';
import { CashTransactionDetails } from './parts/cash-transaction-details';
import { TransferTransactionDetails } from './parts/transfer-transaction-details';
import type { TransactionDetailsProps } from './types';

interface IDetailsSummary {
  icon: ReactNode;
  primaryAmount: IMoneyDto;
  secondaryAmount?: IMoneyDto;
  secondaryText?: string;
  typeLabel: string;
}

export function TransactionDetails({
  details,
}: Readonly<TransactionDetailsProps>) {
  const { t } = useTranslation('journal-entries');

  let summary: IDetailsSummary;

  if (details.kind === 'transfer') {
    summary = {
      icon: (
        <ItemMedia className="size-10 rounded-full bg-info/10">
          <ArrowLeftRight className="size-4 text-info" />
        </ItemMedia>
      ),
      primaryAmount: details.sourceAmount,
      secondaryAmount: details.destinationAmount,
      secondaryText: t('transaction_details_received_text'),
      typeLabel: t('transaction_details_transfer_type'),
    };
  } else if (details.direction === EJournalEntrySourceType.Receipt) {
    const hasLocalValue =
      details.amount.currencyCode !== details.functionalAmount.currencyCode;

    summary = {
      icon: (
        <BalanceEffectIcon
          className="size-10 [&_svg]:size-4"
          effect={ELedgerAccountBalanceEffect.Increase}
        />
      ),
      primaryAmount: details.amount,
      secondaryAmount: hasLocalValue ? details.functionalAmount : undefined,
      secondaryText: t('transaction_details_local_value_text'),
      typeLabel: t('transaction_details_inflow_type'),
    };
  } else {
    const hasLocalValue =
      details.amount.currencyCode !== details.functionalAmount.currencyCode;

    summary = {
      icon: (
        <BalanceEffectIcon
          className="size-10 [&_svg]:size-4"
          effect={ELedgerAccountBalanceEffect.Decrease}
        />
      ),
      primaryAmount: details.amount,
      secondaryAmount: hasLocalValue ? details.functionalAmount : undefined,
      secondaryText: t('transaction_details_local_value_text'),
      typeLabel: t('transaction_details_outflow_type'),
    };
  }

  let transactionContent: ReactNode;
  if (details.kind === 'transfer') {
    transactionContent = <TransferTransactionDetails details={details} />;
  } else {
    transactionContent = <CashTransactionDetails details={details} />;
  }

  const descriptionLabel = t('description_label');
  const attachmentsTitle = t('transaction_details_attachments_title');

  return (
    <div>
      <div className="flex flex-col items-center py-6 text-center">
        {summary.icon}
        <div className="mt-3 text-sm text-muted-foreground">
          {summary.typeLabel}
        </div>
        <div className="mt-1 flex flex-wrap items-baseline justify-center gap-1 font-heading text-2xl font-semibold tabular-nums">
          <Money value={summary.primaryAmount} />
          <span className="text-sm font-medium text-muted-foreground">
            {summary.primaryAmount.currencyCode}
          </span>
        </div>
        {summary.secondaryAmount && summary.secondaryText && (
          <div className="mt-1 flex flex-wrap items-baseline justify-center gap-1 text-xs text-muted-foreground tabular-nums">
            <Money value={summary.secondaryAmount} />
            <span>{summary.secondaryAmount.currencyCode}</span>
            <span>{summary.secondaryText}</span>
          </div>
        )}
        <FormattedDate
          className="mt-2"
          value={new Date(details.effectiveDate)}
        />
      </div>

      {transactionContent}

      {details.memo && (
        <section className="border-t border-border py-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {descriptionLabel}
          </h3>
          <p className="text-sm leading-relaxed">{details.memo}</p>
        </section>
      )}

      {details.attachments.length > 0 && (
        <section className="border-t border-border py-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {attachmentsTitle}
          </h3>
          <ul className="space-y-2">
            {details.attachments.map((attachment) => {
              const openAttachmentAction = t(
                'transaction_details_open_attachment_action',
                { name: attachment.name }
              );

              const attachmentType =
                attachment.type.split('/').at(-1)?.toUpperCase() ||
                attachment.type;

              return (
                <li key={`${attachment.url}-${attachment.name}`}>
                  <a
                    aria-label={openAttachmentAction}
                    className="flex items-center gap-3 rounded-lg bg-muted/40 p-3 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    href={attachment.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Paperclip
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {attachment.name}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {attachmentType} ·{' '}
                        {transactionDetailsHelpers.formatFileSize(
                          attachment.size
                        )}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
