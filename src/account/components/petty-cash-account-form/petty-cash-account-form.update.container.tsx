import { useAccountCurrencyUpdateEligibility } from '@/account/hooks/use-account-currency-update-eligibility';
import { useAccountOpeningBalance } from '@/account/hooks/use-account-opening-balance';
import { useAccountUpdateExchangeRate } from '@/account/hooks/use-account-update-exchange-rate';
import { useUpdatePettyCashAccount } from '@/account/hooks/use-update-petty-cash-account';
import { assetAccountUpdateMapper } from '@/account/lib/mappers/asset-account-update.mapper';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useCurrencies } from '@/shared/hooks/use-currencies';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PettyCashAccountForm } from './petty-cash-account-form';
import { PettyCashAccountFormSkeleton } from './skeleton';
import type {
  IPettyCashAccountFormValues,
  PettyCashAccountFormUpdateContainerProps,
} from './types';

export function PettyCashAccountFormUpdateContainer({
  account,
  onSuccess,
  onCancel,
  onBusyChange,
}: Readonly<PettyCashAccountFormUpdateContainerProps>) {
  const { t } = useTranslation('ledger-accounts');
  // An edit session retains its baseline while background queries refresh.
  const [baseline] = useState(account);
  const update = useUpdatePettyCashAccount(baseline.id);
  const handleApiError = useApiErrorHandler();
  const exchange = useAccountUpdateExchangeRate(baseline);
  const opening = useAccountOpeningBalance(baseline.id);
  const currencies = useCurrencies();
  const currencyEligibility = useAccountCurrencyUpdateEligibility(baseline.id);

  const canUpdateCurrency =
    currencyEligibility.isSuccess &&
    currencyEligibility.isFetchedAfterMount &&
    currencyEligibility.data.canUpdateCurrency;

  const handleSubmit = async (values: IPettyCashAccountFormValues) => {
    if (
      update.isPending ||
      baseline.status === 'archived' ||
      opening.openingBalance === undefined ||
      !currencyEligibility.isSuccess ||
      !currencyEligibility.isFetchedAfterMount
    ) {
      return;
    }

    const request = assetAccountUpdateMapper.toPettyCashUpdateReq(
      {
        ...values,
        currencyCode: canUpdateCurrency
          ? values.currencyCode
          : baseline.balance.currencyCode,
        createWithoutOpeningBalance:
          opening.openingBalance !== null || values.createWithoutOpeningBalance,
      },
      baseline,
      exchange.officialExchangeRate
    );

    if (
      request.currencyCode === undefined &&
      request.name === undefined &&
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

  const currencies_error_text = t('update_currencies_error_text');

  const currency_eligibility_error_text = t(
    'update_currency_eligibility_error_text'
  );

  const opening_balance_error_text = t('update_opening_balance_error_text');

  if (opening.isError) {
    return (
      <div role="alert">
        <p>{opening_balance_error_text}</p>
      </div>
    );
  }

  if (opening.openingBalance === undefined) {
    return <PettyCashAccountFormSkeleton />;
  }

  if (currencyEligibility.isError) {
    return (
      <div role="alert">
        <p>{currency_eligibility_error_text}</p>
      </div>
    );
  }

  if (
    currencyEligibility.isPending ||
    !currencyEligibility.isFetchedAfterMount
  ) {
    return <PettyCashAccountFormSkeleton />;
  }

  if (canUpdateCurrency && currencies.isError) {
    return (
      <div role="alert">
        <p>{currencies_error_text}</p>
      </div>
    );
  }

  if (canUpdateCurrency && currencies.isPending) {
    return <PettyCashAccountFormSkeleton />;
  }

  return (
    <PettyCashAccountForm
      mode="update"
      hasExistingOpeningBalance={opening.openingBalance !== null}
      canUpdateCurrency={canUpdateCurrency}
      accountingCurrencyCode={baseline.functionalBalance.currencyCode}
      currencies={currencies.data ?? []}
      initialValues={assetAccountUpdateMapper.toPettyCashValues(
        baseline,
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
