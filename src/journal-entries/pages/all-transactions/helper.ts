import type { IJournalEntryFilterOptions } from '@/journal-entries/components/transactions-table';
import type { ICounterpartyDto, ILedgerAccountDto } from '@/shared/lib/api/Api';

function filterOptions(
  accounts: ILedgerAccountDto[],
  categories: ILedgerAccountDto[],
  counterparties: ICounterpartyDto[]
): IJournalEntryFilterOptions {
  return {
    accounts: accounts.map((account) => ({
      value: account.id,
      label: account.name,
    })),
    categories: categories.map((account) => ({
      value: account.id,
      label: account.name,
    })),
    counterparties: counterparties.map((party) => ({
      value: party.id,
      label: party.name,
    })),
    currencies: Array.from(
      new Set(accounts.map((account) => account.balance.currencyCode))
    )
      .sort()
      .map((currency) => ({ value: currency, label: currency })),
  };
}

const allTransactionsHelpers = Object.freeze({ filterOptions });
export default allTransactionsHelpers;
