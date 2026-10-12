import { useTranslation } from 'react-i18next';

import type { AccountBehaviorLabelProps } from '../types';

export function AccountBehaviorLabel({
  behavior,
}: Readonly<AccountBehaviorLabelProps>) {
  const { t } = useTranslation('ledger-accounts');

  if (behavior !== 'bank' && behavior !== 'petty_cash') {
    return null;
  }

  const behavior_label = t(
    behavior === 'bank' ? 'bank_account_label' : 'petty_cash_label'
  );

  return <p className="text-sm text-muted-foreground">{behavior_label}</p>;
}
