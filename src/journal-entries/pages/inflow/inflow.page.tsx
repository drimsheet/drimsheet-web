import { AccountTypeSelectionDialog } from '@/account/dialogs/account-type-selection';
import { PettyCashAccountCreationDialog } from '@/account/dialogs/petty-cash-account-creation';
import type { ICashTransactionFormValues } from '@/journal-entries/components/cash-transaction-form';
import { InflowFormContainer } from '@/journal-entries/components/inflow-form';
import { useTransactionContinuation } from '@/journal-entries/hooks/use-transaction-continuation';
import { useSearchParams } from 'react-router-dom';
import type { IInflowPageSearchParams } from './types';

export function InflowPage() {
  const [searchParams] = useSearchParams();

  const params: IInflowPageSearchParams = {
    accountId: searchParams.get('accountId') ?? undefined,
    continuationKey: searchParams.get('continuationKey') ?? undefined,
  };

  const continuation = useTransactionContinuation<ICashTransactionFormValues>(
    'inflow',
    params
  );

  return (
    <>
      <InflowFormContainer
        initialValues={continuation.initialValues}
        restoring={continuation.isRestoring}
        onAddAccount={continuation.handleAddAccount}
        onSuccess={continuation.handleContinuationComplete}
      />
      <AccountTypeSelectionDialog
        open={continuation.showAccountTypeSelection}
        loading={continuation.isSaving}
        onClose={continuation.handleAccountTypeSelectionClose}
        onSubmit={continuation.handleAccountTypeSelected}
      />
      {continuation.showPettyCashAccountCreation && (
        <PettyCashAccountCreationDialog
          open
          onClose={continuation.handlePettyCashAccountCreationClose}
          onSuccess={continuation.handlePettyCashAccountCreated}
        />
      )}
    </>
  );
}
