import {
  PettyCashAccountForm,
  type IPettyCashAccountFormValues,
} from '@/account/components/petty-cash-account-form';
import { useCreatePettyCashAccount } from '@/account/hooks/use-create-petty-cash-account';
import { assetAccountMapper } from '@/account/lib/mappers/asset-account.mapper';
import type { IOpeningBalanceExchangeRateContext } from '@/account/lib/types/opening-balance-exchange-rate.types';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useCurrencies } from '@/shared/hooks/use-currencies';
import { useExchangeRates } from '@/shared/hooks/use-exchange-rates';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export interface PettyCashAccountCreationDialogProps {
  open: boolean;
  onClose: () => void;
}

const defaultExchangeRateContext: IOpeningBalanceExchangeRateContext = {
  currencyCode: '',
  date: '',
  createWithoutOpeningBalance: false,
};

export function PettyCashAccountCreationDialog({
  open,
  onClose,
}: Readonly<PettyCashAccountCreationDialogProps>) {
  const { t } = useTranslation(['ledger-accounts', 'shared']);
  const handleApiError = useApiErrorHandler();
  const [exchangeRateContext, setExchangeRateContext] =
    useState<IOpeningBalanceExchangeRateContext>(defaultExchangeRateContext);

  const { data: currencies = [], isPending: isCurrenciesPending } =
    useCurrencies();
  const { data: accountingEntity, isPending: isAccountingEntityPending } =
    useAccountingEntity();

  const accountingCurrencyCode = accountingEntity?.functionalCurrencyCode ?? '';
  const exchangeRateQuery =
    assetAccountMapper.toOpeningBalanceExchangeRateQuery(
      exchangeRateContext,
      accountingCurrencyCode
    );
  const { data: officialExchangeRates } = useExchangeRates(exchangeRateQuery);
  const officialExchangeRate = officialExchangeRates?.[0];

  const { mutateAsync: createPettyCashAccount, isPending: isCreating } =
    useCreatePettyCashAccount();

  const formDisabled =
    isCurrenciesPending || isAccountingEntityPending || !accountingCurrencyCode;

  const handleClose = () => {
    setExchangeRateContext(defaultExchangeRateContext);
    onClose();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleClose();
    }
  };

  const handleSubmit = async (values: IPettyCashAccountFormValues) => {
    try {
      const request = assetAccountMapper.toPettyCashAccountCreationDto(
        values,
        accountingCurrencyCode,
        officialExchangeRate
      );
      await createPettyCashAccount(request);
      toast.success(
        t('ledger-accounts:petty_cash_account_created_success_text')
      );
      handleClose();
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  const create_petty_cash_account_title = t(
    'ledger-accounts:create_petty_cash_account'
  );
  const create_petty_cash_account_description = t(
    'ledger-accounts:create_petty_cash_account_description'
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{create_petty_cash_account_title}</DialogTitle>
          <DialogDescription className="sr-only">
            {create_petty_cash_account_description}
          </DialogDescription>
        </DialogHeader>

        <PettyCashAccountForm
          accountingCurrencyCode={accountingCurrencyCode}
          currencies={currencies}
          disabled={formDisabled}
          initialValues={{
            currencyCode: accountingCurrencyCode,
          }}
          loading={isCreating}
          officialExchangeRate={officialExchangeRate}
          onExchangeRateContextChange={setExchangeRateContext}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
