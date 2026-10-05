import { useGetBankByCountry } from '@/account/hooks/use-get-bank-by-country';
import { useState } from 'react';
import { BankAccountForm } from './bank-account-form';
import type { BankAccountFormContainerProps } from './types';

export function BankAccountFormContainer({
  accountingCurrencyCode,
  initialBankLocation = '',
  initialValues,
  ...props
}: Readonly<BankAccountFormContainerProps>) {
  const [selectedLocation, setSelectedLocation] = useState<string>(
    initialValues?.bankLocation ?? initialBankLocation
  );

  const { data: banks = [], isPending: isBanksLoading } =
    useGetBankByCountry(selectedLocation);

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  return (
    <BankAccountForm
      {...props}
      accountingCurrencyCode={accountingCurrencyCode}
      banks={banks}
      isBanksLoading={isBanksLoading}
      initialValues={initialValues}
      onBankLocationChange={handleLocationChange}
    />
  );
}
