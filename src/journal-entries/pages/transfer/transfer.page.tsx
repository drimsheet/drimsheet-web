import { AccountTypeSelectionDialog } from '@/account/dialogs/account-type-selection';
import { PettyCashAccountCreationDialog } from '@/account/dialogs/petty-cash-account-creation';
import type { ICashTransferFormValues } from '@/journal-entries/components/cash-transfer-form';
import { CashTransferFormContainer } from '@/journal-entries/components/cash-transfer-form';
import { useTransactionContinuation } from '@/journal-entries/hooks/use-transaction-continuation';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ITransferPageSearchParams } from './types';

export function TransferPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const params: ITransferPageSearchParams = {
    sourceAccountId: searchParams.get('sourceAccountId') ?? undefined,
    destinationAccountId: searchParams.get('destinationAccountId') ?? undefined,
    continuationKey: searchParams.get('continuationKey') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
    categoryItemId: searchParams.get('categoryItemId') ?? undefined,
  };

  const continuation = useTransactionContinuation<ICashTransferFormValues>(
    'transfer',
    params
  );

  const handleSuccess = async () => {
    await continuation.handleContinuationComplete();
    await navigate('/transactions');
  };

  return (
    <>
      <CashTransferFormContainer
        initialValues={continuation.initialValues}
        restoring={continuation.isRestoring}
        onAddAccount={continuation.handleAddAccount}
        onAddCategory={continuation.handleAddCategory}
        initialEditItemId={continuation.categoryItemId}
        onSuccess={handleSuccess}
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
