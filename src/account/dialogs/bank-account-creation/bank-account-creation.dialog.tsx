import {
  BankAccountFormContainer,
  type IBankAccountFormValues,
} from '@/account/components/bank-account-form';
import { useCreateBankAccount } from '@/account/hooks/use-create-bank-account';
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
import { DocumentUpload } from '@/shared/components/document-upload';
import { EFileType } from '@/shared/components/document-upload/types';
import { Separator } from '@/shared/components/separator';
import countries from '@/shared/configs/countries.json' with { type: 'json' };
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useCurrencies } from '@/shared/hooks/use-currencies';
import { useExchangeRates } from '@/shared/hooks/use-exchange-rates';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export interface BankAccountCreationDialogProps {
  open: boolean;
  onClose: () => void;
}

const defaultExchangeRateContext: IOpeningBalanceExchangeRateContext = {
  currencyCode: '',
  date: '',
  createWithoutOpeningBalance: false,
};

export function BankAccountCreationDialog({
  open,
  onClose,
}: Readonly<BankAccountCreationDialogProps>) {
  const { t } = useTranslation(['ledger-accounts', 'shared']);
  const handleApiError = useApiErrorHandler();

  const [statementFiles, setStatementFiles] = useState<File[]>([]);
  const [exchangeRateContext, setExchangeRateContext] =
    useState<IOpeningBalanceExchangeRateContext>(defaultExchangeRateContext);

  const { data: currencies = [], isPending: isCurrenciesPending } =
    useCurrencies();
  const { data: accountingEntity, isPending: isAccountingEntityPending } =
    useAccountingEntity();

  const accountingCurrencyCode = accountingEntity?.functionalCurrencyCode ?? '';
  const initialJurisdiction = accountingEntity?.jurisdictionCode ?? '';

  const { data: officialExchangeRates } = useExchangeRates(
    assetAccountMapper.toOpeningBalanceExchangeRateQuery(
      exchangeRateContext,
      accountingCurrencyCode
    )
  );
  const officialExchangeRate = officialExchangeRates?.[0];

  const { mutateAsync: createBankAccount, isPending: isCreating } =
    useCreateBankAccount();

  const formDisabled =
    isCurrenciesPending || isAccountingEntityPending || !accountingCurrencyCode;

  const handleClose = () => {
    setStatementFiles([]);
    setExchangeRateContext(defaultExchangeRateContext);
    onClose();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleClose();
    }
  };

  const handleSubmit = async (values: IBankAccountFormValues) => {
    try {
      const request = assetAccountMapper.toBankAccountCreationDto(
        values,
        accountingCurrencyCode,
        officialExchangeRate
      );
      await createBankAccount(request);
      toast.success(t('ledger-accounts:bank_account_created_success_text'));
      handleClose();
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  const create_bank_account_title = t('ledger-accounts:create_bank_account');
  const create_bank_account_description = t(
    'ledger-accounts:create_bank_account_description'
  );
  const upload_bank_statement_title = t(
    'ledger-accounts:upload_bank_statement_title'
  );
  const upload_bank_statement_description = t(
    'ledger-accounts:upload_bank_statement_description'
  );
  const upload_bank_statement_action = t(
    'ledger-accounts:upload_bank_statement_action'
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{create_bank_account_title}</DialogTitle>
          <DialogDescription className="sr-only">
            {create_bank_account_description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto_1fr] md:items-start">
          <div className="order-2 min-w-0 md:order-1">
            <BankAccountFormContainer
              key={initialJurisdiction}
              accountingCurrencyCode={accountingCurrencyCode}
              bankLocations={countries}
              currencies={currencies}
              disabled={formDisabled}
              initialBankLocation={initialJurisdiction}
              initialValues={{
                currencyCode: accountingCurrencyCode,
                bankLocation: initialJurisdiction,
              }}
              loading={isCreating}
              officialExchangeRate={officialExchangeRate}
              onExchangeRateContextChange={setExchangeRateContext}
              onSubmit={handleSubmit}
            />
          </div>

          <Separator
            orientation="vertical"
            className="hidden h-full md:order-2 md:block"
          />

          <div className="order-1 min-w-0 md:order-3">
            <DocumentUpload
              accept={[EFileType.Pdf]}
              actionText={upload_bank_statement_action}
              allowMultiple={false}
              description={upload_bank_statement_description}
              onUpload={setStatementFiles}
              title={upload_bank_statement_title}
              value={statementFiles}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
