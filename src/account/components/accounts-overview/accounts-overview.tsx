import { LedgerTypeIcon } from '@/account/components/ledger-type-icon';
import { Money } from '@/shared/components/money';
import {
  ELedgerType,
  type IMoneyDto,
  type ULedgerType,
} from '@/shared/lib/api/Api';
import { cn } from '@/shared/lib/utils/cn';
import { useTranslation } from 'react-i18next';

export interface LedgerAccountsOverviewProps {
  type: ULedgerType;
  title: string;
  balance: IMoneyDto;
  description: string;
  className?: string;
}

export function LedgerAccountsOverview({
  type,
  title,
  balance,
  description,
  className,
}: Readonly<LedgerAccountsOverviewProps>) {
  const { t } = useTranslation(['shared']);

  const ledgerTypeLabels: Record<ULedgerType, string> = {
    [ELedgerType.Revenue]: t('shared:revenue'),
    [ELedgerType.Expense]: t('shared:expense'),
    [ELedgerType.Asset]: t('shared:asset'),
    [ELedgerType.Liability]: t('shared:liability'),
    [ELedgerType.Equity]: t('shared:equity'),
  };

  const ledgerTypeLabel = ledgerTypeLabels[type] || type;

  return (
    <div
      className={cn(
        'flex items-center justify-between p-5 sm:p-5 border border-border bg-card text-card-foreground rounded-2xl shadow-xs',
        'hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 hover:bg-muted/10',
        'transition-all duration-300 ease-in-out cursor-pointer select-none',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <LedgerTypeIcon type={type} />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {ledgerTypeLabel}
          </span>
          <span className="text-base font-semibold text-foreground font-heading leading-tight">
            {title}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <Money
          className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight leading-none"
          value={balance}
        />
        <span className="text-xs sm:text-sm text-muted-foreground text-right leading-normal mt-0.5">
          {description}
        </span>
      </div>
    </div>
  );
}

export function LedgerAccountsOverviewSkeleton() {
  return (
    <div className="flex items-center justify-between p-5 sm:p-5 border border-border bg-card text-card-foreground rounded-2xl shadow-xs animate-pulse">
      {/* Left Section: Icon and Titles */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-muted" />
        <div className="flex flex-col gap-0.5">
          <span className="w-16 h-3 rounded bg-muted" />
          <span className="w-24 h-5 rounded bg-muted mt-1" />
        </div>
      </div>

      {/* Right Section: Balance and Description */}
      <div className="flex flex-col items-end gap-0.5">
        <span className="w-20 h-6 rounded bg-muted" />
        <span className="w-32 h-3 rounded bg-muted mt-1" />
      </div>
    </div>
  );
}
