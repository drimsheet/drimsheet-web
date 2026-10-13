import { BankDetailsFormUpdateContainer } from '@/account/components/bank-details-form';
import { PettyCashAccountFormUpdateContainer } from '@/account/components/petty-cash-account-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AccountUpdateDialogProps } from './types';

export function AccountUpdateDialog({
  account,
  open,
  session,
  onClose,
}: Readonly<AccountUpdateDialogProps>) {
  const { t } = useTranslation('ledger-accounts');
  const [busy, setBusy] = useState(false);

  const handleClose = () => {
    if (!busy) onClose();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) handleClose();
  };

  const title_text = t(
    account.behavior === 'bank'
      ? 'update_bank_account_title'
      : 'update_petty_cash_account_title'
  );

  const description_text = t('update_account_description');

  const common = {
    account,
    onSuccess: onClose,
    onCancel: handleClose,
    onBusyChange: setBusy,
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg"
        showCloseButton={!busy}
      >
        <DialogHeader>
          <DialogTitle>{title_text}</DialogTitle>
          <DialogDescription className="sr-only">
            {description_text}
          </DialogDescription>
        </DialogHeader>
        {account.behavior === 'bank' && (
          <BankDetailsFormUpdateContainer key={session} {...common} />
        )}
        {account.behavior === 'petty_cash' && (
          <PettyCashAccountFormUpdateContainer key={session} {...common} />
        )}
      </DialogContent>
    </Dialog>
  );
}
