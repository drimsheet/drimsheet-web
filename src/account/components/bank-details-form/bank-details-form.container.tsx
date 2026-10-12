import { useGetBankByCountry } from '@/account/hooks/use-get-bank-by-country';
import { useState } from 'react';
import { BankDetailsForm } from './bank-details-form';
import type { BankDetailsFormContainerProps } from './types';

export function BankDetailsFormContainer({
  accountingCurrencyCode,
  initialBankLocation = '',
  initialValues,
  ...props
}: Readonly<BankDetailsFormContainerProps>) {
  const [selectedLocation, setSelectedLocation] = useState<string>(
    initialValues?.bankLocation ?? initialBankLocation
  );

  const { data: banks = [], isPending: isBanksLoading } =
    useGetBankByCountry(selectedLocation);

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  return (
    <BankDetailsForm
      {...props}
      accountingCurrencyCode={accountingCurrencyCode}
      banks={banks}
      isBanksLoading={isBanksLoading}
      initialValues={initialValues}
      onBankLocationChange={handleLocationChange}
    />
  );
}
