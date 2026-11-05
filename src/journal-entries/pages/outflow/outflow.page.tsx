import { AccountTypeSelectionDialog } from '@/account/dialogs/account-type-selection';
import { PettyCashAccountCreationDialog } from '@/account/dialogs/petty-cash-account-creation';
import { CounterpartyCreationDialog } from '@/counterparty/dialogs/counterparty-creation';
import { CounterpartyRoleSelectionDialog } from '@/counterparty/dialogs/counterparty-role-selection';
import type { ICashTransactionFormValues } from '@/journal-entries/components/cash-transaction-form';
import { OutflowFormContainer } from '@/journal-entries/components/outflow-form';
import { useTransactionContinuation } from '@/journal-entries/hooks/use-transaction-continuation';
import { useSearchParams } from 'react-router-dom';
import type { IOutflowPageSearchParams } from './types';

export function OutflowPage() {
  const [searchParams] = useSearchParams();

  const params: IOutflowPageSearchParams = {
    accountId: searchParams.get('accountId') ?? undefined,
    continuationKey: searchParams.get('continuationKey') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
    categoryItemId: searchParams.get('categoryItemId') ?? undefined,
  };

  const continuation = useTransactionContinuation<ICashTransactionFormValues>(
    'outflow',
    params
  );

  return (
    <>
      <OutflowFormContainer
        initialValues={continuation.initialValues}
        restoring={continuation.isRestoring}
        onAddCounterparty={continuation.handleAddCounterparty}
        onAddAccount={continuation.handleAddAccount}
        onAddCategory={continuation.handleAddCategory}
        initialEditItemId={continuation.categoryItemId}
        onSuccess={continuation.handleContinuationComplete}
      />
      <CounterpartyRoleSelectionDialog
        open={continuation.showCounterpartyRoleSelection}
        onClose={continuation.handleCounterpartyRoleSelectionClose}
        onCloseAutoFocus={
          continuation.handleCounterpartyRoleSelectionCloseAutoFocus
        }
        onSubmit={continuation.handleCounterpartyRoleSelected}
      />
      {continuation.counterpartyRole && (
        <CounterpartyCreationDialog
          open
          role={continuation.counterpartyRole}
          initialValues={continuation.counterpartyInitialValues}
          onClose={continuation.handleCounterpartyCreationClose}
          onCloseAutoFocus={
            continuation.handleCounterpartyCreationCloseAutoFocus
          }
          onSuccess={continuation.handleCounterpartyCreated}
        />
      )}
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
