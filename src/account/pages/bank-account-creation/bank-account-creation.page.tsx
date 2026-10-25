import {
  BankDetailsFormContainer,
  BankDetailsFormSkeleton,
  type IBankDetailsFormValues,
} from '@/account/components/bank-details-form';
import { useCreateBankAccount } from '@/account/hooks/use-create-bank-account';
import { assetAccountMapper } from '@/account/lib/mappers/asset-account.mapper';
import type { IOpeningBalanceExchangeRateContext } from '@/account/lib/types/opening-balance-exchange-rate.types';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { Alert, AlertDescription } from '@/shared/components/alert';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { DocumentUpload } from '@/shared/components/document-upload';
import { EFileType } from '@/shared/components/document-upload/types';
import countries from '@/shared/configs/countries.json' with { type: 'json' };
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useCurrencies } from '@/shared/hooks/use-currencies';
import { useExchangeRates } from '@/shared/hooks/use-exchange-rates';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const defaultExchangeRateContext: IOpeningBalanceExchangeRateContext = {
  currencyCode: '',
  date: '',
  createWithoutOpeningBalance: false,
};

export function BankAccountCreationPage() {
  const { t } = useTranslation(['ledger-accounts', 'shared']);
  const navigate = useNavigate();
  const handleApiError = useApiErrorHandler();

  const [statementFiles, setStatementFiles] = useState<File[]>([]);

  const [exchangeRateContext, setExchangeRateContext] =
    useState<IOpeningBalanceExchangeRateContext>(defaultExchangeRateContext);

  const {
    data: currencies = [],
    isPending: isCurrenciesPending,
    isError: isCurrenciesError,
  } = useCurrencies();

  const {
    data: accountingEntity,
    isPending: isAccountingEntityPending,
    isError: isAccountingEntityError,
  } = useAccountingEntity();

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

  const isFormLoading = isCurrenciesPending || isAccountingEntityPending;

  const hasFormError =
    isCurrenciesError ||
    isAccountingEntityError ||
    (!isFormLoading && !accountingCurrencyCode);

  const handleSubmit = async (values: IBankDetailsFormValues) => {
    try {
      const request = assetAccountMapper.toBankAccountCreationDto(
        values,
        accountingCurrencyCode,
        officialExchangeRate
      );

      await createBankAccount(request);
      toast.success(t('ledger-accounts:bank_account_created_success_text'));
      navigate('/accounts', { replace: true });
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  const create_bank_account_title = t('ledger-accounts:create_bank_account');

  const form_error_text = t('ledger-accounts:details_load_error_text');

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
    <AppBody title={create_bank_account_title}>
      <div className="mt-7 flex min-w-0 flex-col gap-8 md:gap-12">
        <div className="grid min-w-0 grid-cols-1 items-start gap-8 md:gap-12 lg:grid-cols-2">
          <AppSection
            aria-label={upload_bank_statement_title}
            // Align with the inputs after the section heading, section gap,
            // field label, and label-to-control gap.
            className="gap-5 p-0 lg:col-start-2 lg:row-start-1 lg:mt-[calc(--spacing(4)+--spacing(5)+0.875rem+--spacing(3))]"
          >
            <DocumentUpload
              accept={[EFileType.Pdf]}
              actionText={upload_bank_statement_action}
              allowMultiple={false}
              className="min-h-80 bg-muted text-muted-foreground [&>div]:border-0"
              description={upload_bank_statement_description}
              onUpload={setStatementFiles}
              title={upload_bank_statement_title}
              value={statementFiles}
            />
          </AppSection>
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            {hasFormError && (
              <Alert variant="destructive">
                <AlertDescription>{form_error_text}</AlertDescription>
              </Alert>
            )}
            {!hasFormError && isFormLoading && <BankDetailsFormSkeleton />}
            {!hasFormError && !isFormLoading && (
              <BankDetailsFormContainer
                key={initialJurisdiction}
                accountingCurrencyCode={accountingCurrencyCode}
                bankLocations={countries}
                currencies={currencies}
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
            )}
          </div>
        </div>
      </div>
    </AppBody>
  );
}
