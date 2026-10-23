import { PageSection } from '@/shared/components/page-section';
import countries from '@/shared/configs/countries.json';
import { cn } from '@/shared/lib/utils/cn';
import { useTranslation } from 'react-i18next';

import type { BankDetailsProps } from '../types';

export function BankDetails({
  bankDetails,
  className,
  ...props
}: Readonly<BankDetailsProps>) {
  const { t } = useTranslation('ledger-accounts');
  const { bankName, accountName, accountNumber, countryCode } = bankDetails;

  const countryName =
    countries.find((country) => country.code === countryCode.toUpperCase())
      ?.name ?? countryCode;

  const bank_details_title = t('bank_details_title');
  const bank_label = t('bank_details_bank_label');
  const account_holder_label = t('bank_details_account_holder_label');
  const account_number_label = t('bank_details_account_number_label');
  const country_label = t('bank_details_country_label');

  return (
    <PageSection
      title={bank_details_title}
      role="region"
      aria-label={bank_details_title}
      className={cn(
        '@container min-w-0 rounded-sm bg-muted px-6 shadow-none ring-0',
        className
      )}
      {...props}
    >
      <div>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-6 @sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
            <dt className="text-sm text-muted-foreground">{bank_label}</dt>
            <dd className="text-base wrap-anywhere">{bankName}</dd>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <dt className="text-sm text-muted-foreground">
              {account_holder_label}
            </dt>
            <dd className="text-base wrap-anywhere">{accountName}</dd>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <dt className="text-sm text-muted-foreground">
              {account_number_label}
            </dt>
            <dd className="text-base tabular-nums wrap-anywhere">
              {accountNumber}
            </dd>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <dt className="text-sm text-muted-foreground">{country_label}</dt>
            <dd className="text-base wrap-anywhere">{countryName}</dd>
          </div>
        </dl>
      </div>
    </PageSection>
  );
}
