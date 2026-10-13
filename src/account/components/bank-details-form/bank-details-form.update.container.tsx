import { useAccountCurrencyUpdateEligibility } from '@/account/hooks/use-account-currency-update-eligibility';
import { useAccountOpeningBalance } from '@/account/hooks/use-account-opening-balance';
import { useAccountUpdateExchangeRate } from '@/account/hooks/use-account-update-exchange-rate';
import { useUpdateBankAccount } from '@/account/hooks/use-update-asset-account';
import { assetAccountUpdateMapper } from '@/account/lib/mappers/asset-account-update.mapper';
import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { Button } from '@/shared/components/button';
import countries from '@/shared/configs/countries.json' with { type: 'json' };
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useCurrencies } from '@/shared/hooks/use-currencies';
import type { IBankDetails } from '@/shared/lib/api/Api';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BankDetailsFormContainer } from './bank-details-form.container';
import type {
  BankDetailsFormUpdateContainerProps,
  IBankDetailsFormValues,
} from './types';

export function BankDetailsFormUpdateContainer({
  account,
  onSuccess,
  onCancel,
  onBusyChange,
}: Readonly<BankDetailsFormUpdateContainerProps>) {
  const { t } = useTranslation('ledger-accounts');
  const [baseline] = useState(account);
  const [bank, setBank] = useState<IBankDetails>();
  const update = useUpdateBankAccount(baseline.id);
  const handleApiError = useApiErrorHandler();
  const exchange = useAccountUpdateExchangeRate(baseline);
  const opening = useAccountOpeningBalance(baseline.id);
  const currencies = useCurrencies();
  const currencyEligibility = useAccountCurrencyUpdateEligibility(baseline.id);

  const canUpdateCurrency =
    currencyEligibility.isSuccess &&
    currencyEligibility.isFetchedAfterMount &&
    currencyEligibility.data.canUpdateCurrency;

  const read = useQuery({
    queryKey: ['ledgerAccountService', 'getBankDetails', baseline.id, 'update'],
    queryFn: () => ledgerAccountService.getBankDetails(baseline.id),
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  if (!bank && read.isFetchedAfterMount && read.isSuccess && !read.isFetching)
    setBank(read.data);

  const handleSubmit = async (values: IBankDetailsFormValues) => {
    if (
      !bank ||
      update.isPending ||
      baseline.status === 'archived' ||
      opening.openingBalance === undefined ||
      !currencyEligibility.isSuccess ||
      !currencyEligibility.isFetchedAfterMount
    )
      return;

    const request = assetAccountUpdateMapper.toBankUpdateReq(
      {
        ...values,
        currencyCode: canUpdateCurrency
          ? values.currencyCode
          : baseline.balance.currencyCode,
        createWithoutOpeningBalance:
          opening.openingBalance !== null || values.createWithoutOpeningBalance,
      },
      baseline,
      bank,
      exchange.officialExchangeRate
    );

    if (
      request.currencyCode === undefined &&
      request.name === undefined &&
      request.bankAccount === undefined &&
      request.openingBalance === undefined
    ) {
      onSuccess();

      return;
    }

    try {
      await update.mutateAsync(request);
      toast.success(t('account_updated_success_text'));
      onSuccess();
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  useEffect(() => {
    onBusyChange(update.isPending);

    return () => onBusyChange(false);
  }, [update.isPending, onBusyChange]);

  const error_text = t('update_bank_details_error_text');
  const retry_label = t('details_retry_label');
  const loading_text = t('update_loading_text');
  const currencies_error_text = t('update_currencies_error_text');

  const currency_eligibility_error_text = t(
    'update_currency_eligibility_error_text'
  );

  const opening_balance_error_text = t('update_opening_balance_error_text');

  if (opening.isError)
    return (
      <div role="alert">
        <p>{opening_balance_error_text}</p>
        <Button onClick={() => void opening.refetch()}>{retry_label}</Button>
      </div>
    );

  if (opening.openingBalance === undefined)
    return <p role="status">{loading_text}</p>;

  if (!bank && read.isError)
    return (
      <div role="alert">
        <p>{error_text}</p>
        <Button onClick={() => void read.refetch()}>{retry_label}</Button>
      </div>
    );

  if (!bank) return <p role="status">{loading_text}</p>;

  if (currencyEligibility.isError)
    return (
      <div role="alert">
        <p>{currency_eligibility_error_text}</p>
        <Button onClick={() => void currencyEligibility.refetch()}>
          {retry_label}
        </Button>
      </div>
    );

  if (currencyEligibility.isPending || !currencyEligibility.isFetchedAfterMount)
    return <p role="status">{loading_text}</p>;

  if (canUpdateCurrency && currencies.isError)
    return (
      <div role="alert">
        <p>{currencies_error_text}</p>
        <Button onClick={() => void currencies.refetch()}>{retry_label}</Button>
      </div>
    );

  if (canUpdateCurrency && currencies.isPending)
    return <p role="status">{loading_text}</p>;

  return (
    <BankDetailsFormContainer
      mode="update"
      hasExistingOpeningBalance={opening.openingBalance !== null}
      canUpdateCurrency={canUpdateCurrency}
      accountingCurrencyCode={baseline.functionalBalance.currencyCode}
      currencies={currencies.data ?? []}
      bankLocations={countries}
      initialValues={assetAccountUpdateMapper.toBankValues(
        baseline,
        bank,
        opening.openingBalance
      )}
      disabled={baseline.status === 'archived'}
      loading={update.isPending}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      {...exchange}
    />
  );
}
