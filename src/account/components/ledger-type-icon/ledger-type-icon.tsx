import { ELedgerType, type ULedgerType } from '@/shared/lib/api/Api';
import { cn } from '@/shared/lib/utils/cn';
import { CreditCard, Receipt, Scale, TrendingUp, Wallet } from 'lucide-react';

export interface LedgerTypeIconProps {
  type: ULedgerType;
  className?: string;
}

const typeConfigs = {
  [ELedgerType.Revenue]: {
    icon: TrendingUp,
    style:
      'bg-financial-income-surface text-financial-income border-financial-income',
  },
  [ELedgerType.Expense]: {
    icon: Receipt,
    style:
      'bg-financial-expense-surface text-financial-expense border-financial-expense',
  },
  [ELedgerType.Asset]: {
    icon: Wallet,
    style: 'bg-info-surface text-info border-info-border',
  },
  [ELedgerType.Liability]: {
    icon: CreditCard,
    style: 'bg-warning-surface text-warning border-warning-border',
  },
  [ELedgerType.Equity]: {
    icon: Scale,
    style: 'bg-selection text-selection-foreground border-primary',
  },
};

export function LedgerTypeIcon({
  type,
  className,
}: Readonly<LedgerTypeIconProps>) {
  const config = typeConfigs[type];
  if (!config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center justify-center p-2 rounded-xl border shrink-0',
        config.style,
        className
      )}
    >
      <Icon className="size-5" />
    </div>
  );
}
