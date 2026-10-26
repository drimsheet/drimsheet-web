import { useBankDetails } from '@/account/hooks/use-bank-details';
import { useTranslation } from 'react-i18next';
import type { AccountSectionProps } from '../types';
import { BankDetails, BankDetailsSkeleton } from './bank-details';
import { SectionError } from './section-error';

export function BankDetailsContainer({
  accountId,
}: Readonly<AccountSectionProps>) {
  const { t } = useTranslation('ledger-accounts');
  const bank = useBankDetails(accountId);
  const title = t('bank_details_title');
  const missing_text = t('details_bank_missing_text');

  if (bank.isPending) {
    return <BankDetailsSkeleton />;
  }

  if (bank.isError) {
    return <SectionError title={title} />;
  }

  if (!bank.data) {
    return <p className="text-sm text-muted-foreground">{missing_text}</p>;
  }

  return <BankDetails bankDetails={bank.data} />;
}
