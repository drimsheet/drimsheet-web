import { LedgerAccountsOverview } from '@/account/components/accounts-overview';
import { LedgerAccountsTableContainer } from '@/account/components/accounts-table';
import { AccountTypeSelectionDialog } from '@/account/dialogs/account-type-selection';
import { BankAccountCreationDialog } from '@/account/dialogs/bank-account-creation';
import { PettyCashAccountCreationDialog } from '@/account/dialogs/petty-cash-account-creation';
import { AppBody, AppHeader } from '@/shared/components/app';
import {
  ELedgerAccountBehavior,
  ELedgerType,
  type ULedgerAccountBehavior,
} from '@/shared/lib/api/Api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function AccountsDashboardPage() {
  const { t } = useTranslation(['ledger-accounts', 'shared']);

  const [showAccountTypeSelection, setShowAccountTypeSelection] =
    useState(false);
  const [selectedBehavior, setSelectedBehavior] =
    useState<ULedgerAccountBehavior | null>(null);

  const handleAccountTypeSelected = (behavior: ULedgerAccountBehavior) => {
    setShowAccountTypeSelection(false);
    setSelectedBehavior(behavior);
  };

  const accounts_label = t('shared:accounts');
  const total_vault_balance_label = t('ledger-accounts:total_vault_balance');
  const accounts_count_text = t('ledger-accounts:accounts_count', {
    count: 12,
  });

  return (
    <>
      <AppHeader breadcrumbs={[{ label: accounts_label }]} />

      <AppBody>
        <LedgerAccountsOverview
          type={ELedgerType.Asset}
          title={total_vault_balance_label}
          balance={{ amount: 12500, currencyCode: 'USD', isMinorUnit: true }}
          description={accounts_count_text}
        />

        <LedgerAccountsTableContainer
          onAddAccount={() => setShowAccountTypeSelection(true)}
        />

        <AccountTypeSelectionDialog
          open={showAccountTypeSelection}
          onClose={() => setShowAccountTypeSelection(false)}
          onSubmit={handleAccountTypeSelected}
        />

        <PettyCashAccountCreationDialog
          open={selectedBehavior === ELedgerAccountBehavior.PettyCash}
          onClose={() => setSelectedBehavior(null)}
        />

        <BankAccountCreationDialog
          open={selectedBehavior === ELedgerAccountBehavior.Bank}
          onClose={() => setSelectedBehavior(null)}
        />
      </AppBody>
    </>
  );
}
