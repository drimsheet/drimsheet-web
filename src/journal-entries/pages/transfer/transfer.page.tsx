import { AccountTypeSelectionDialog } from '@/account/dialogs/account-type-selection';
import { PettyCashAccountCreationDialog } from '@/account/dialogs/petty-cash-account-creation';
import type { ICashTransferFormValues } from '@/journal-entries/components/cash-transfer-form';
import { CashTransferFormContainer } from '@/journal-entries/components/cash-transfer-form';
import { useTransactionContinuation } from '@/journal-entries/hooks/use-transaction-continuation';
import { useSearchParams } from 'react-router-dom';
import type { ITransferPageSearchParams } from './types';

export function TransferPage() {
  const [searchParams] = useSearchParams();

  const params: ITransferPageSearchParams = {
    sourceAccountId: searchParams.get('sourceAccountId') ?? undefined,
    destinationAccountId: searchParams.get('destinationAccountId') ?? undefined,
    continuationKey: searchParams.get('continuationKey') ?? undefined,
  };

  const continuation = useTransactionContinuation<ICashTransferFormValues>(
    'transfer',
    params
  );

  return (
    <>
      <CashTransferFormContainer
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
