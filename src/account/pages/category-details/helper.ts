import currencies from '@/shared/configs/currencies.json';
import type {
  IAccountBalanceContributionsByCounterpartyDto,
  IJournalEntryListDto,
  ILedgerAccountDto,
  IMoneyDto,
} from '@/shared/lib/api/Api';
import { format, startOfMonth, subMonths } from 'date-fns';
import type { ICategoryMonth, ICategoryTransaction } from './types';

const unassignedId = 'unassigned';

function majorUnits(money: IMoneyDto) {
  if (!money.isMinorUnit) {
    return money.amount;
  }

  const currency = currencies.find(
    ({ code }) => code.toUpperCase() === money.currencyCode.toUpperCase()
  );

  return money.amount / 10 ** (currency?.minorUnit ?? 0);
}

function activity(
  entries: IJournalEntryListDto[],
  account: Pick<ILedgerAccountDto, 'id' | 'type' | 'functionalBalance'>,
  now: Date
) {
  const currencyCode = account.functionalBalance.currencyCode;
  const normalSide = account.type === 'revenue' ? 'credit' : 'debit';

  const months: ICategoryMonth[] = Array.from({ length: 6 }, (_, index) => ({
    month: format(subMonths(startOfMonth(now), 5 - index), 'yyyy-MM'),
    amount: 0,
  }));

  const transactions: ICategoryTransaction[] = [];

  for (const entry of entries) {
    const lines = entry.lines.filter((line) => line.account.id === account.id);

    if (!lines.length) {
      continue;
    }

    const counterparties = new Map<
      string,
      { id: string; name: string | null }
    >();

    let amount = 0;

    const isActivity =
      entry.postedAt !== null &&
      entry.voidedAt === null &&
      entry.voidingEntryId === null &&
      (entry.status === 'posted' || entry.status === 'archived') &&
      entry.sourceType !== 'opening_balance' &&
      entry.sourceType !== 'reversal';

    for (const line of lines) {
      // Functional amounts keep foreign-currency postings comparable to the category balance.
      if (
        line.functionalAmount.currencyCode.toUpperCase() !==
        currencyCode.toUpperCase()
      ) {
        throw new Error(
          'Category activity contains inconsistent functional currencies'
        );
      }

      const value =
        majorUnits(line.functionalAmount) * (line.side === normalSide ? 1 : -1);

      const counterparty = line.counterparty ?? {
        id: entry.sourceType === 'transfer' ? 'self' : unassignedId,
        name: null,
      };

      counterparties.set(counterparty.id, {
        id: counterparty.id,
        name: counterparty.name,
      });
      amount += value;
    }

    transactions.push({
      id: entry.id,
      effectiveDate: entry.effectiveDate,
      description:
        entry.memo ??
        lines.find((line) => line.description)?.description ??
        null,
      counterparties: [...counterparties.values()],
      amount: { amount, currencyCode, isMinorUnit: false },
      status: entry.status,
    });

    const month = months.find(
      (bucket) => bucket.month === entry.effectiveDate.slice(0, 7)
    );

    if (isActivity && month) {
      month.amount += amount;
    }
  }

  return { months, transactions };
}

function filterTransactions(
  transactions: ICategoryTransaction[],
  search: string,
  counterpartyId: string | null,
  direction: 'asc' | 'desc'
) {
  const query = search.trim().toLocaleLowerCase();

  return transactions
    .filter((row) => {
      const matchesCounterparty =
        counterpartyId === null ||
        row.counterparties.some(({ id }) => id === counterpartyId);

      const matchesSearch =
        `${row.description ?? ''} ${row.counterparties.map(({ name }) => name ?? '').join(' ')}`
          .toLocaleLowerCase()
          .includes(query);

      return matchesCounterparty && matchesSearch;
    })
    .sort((a, b) => {
      const order =
        a.effectiveDate.localeCompare(b.effectiveDate) ||
        a.id.localeCompare(b.id);

      return direction === 'asc' ? order : -order;
    });
}

function participationId(row: IAccountBalanceContributionsByCounterpartyDto) {
  if (row.counterparty) {
    return row.counterparty.id;
  }

  return row.isSelf ? 'self' : unassignedId;
}

const categoryDetailsHelpers = Object.freeze({
  activity,
  filterTransactions,
  participationId,
});

export default categoryDetailsHelpers;
