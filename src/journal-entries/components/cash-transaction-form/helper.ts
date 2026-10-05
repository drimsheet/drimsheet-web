import type { IItemizedFieldValue } from '@/journal-entries/components/itemized-fields';
import type {
  IExchangeRate,
  IJournalCounterpartyReq,
  ILedgerAccountDto,
} from '@/shared/lib/api/Api';
import { dateUtils } from '@/shared/lib/utils/date';
import type {
  ICashTransactionFormValues,
  UCashTransactionFormVariant,
} from './types';

const COUNTERPARTY_TEXT_KEYS = Object.freeze({
  default: {
    empty: 'cash_transaction_counterparty_empty_text',
    label: 'cash_transaction_counterparty_label',
    placeholder: 'cash_transaction_counterparty_placeholder',
    required: 'cash_transaction_counterparty_required_text',
  },
  inflow: {
    empty: 'cash_transaction_payer_empty_text',
    label: 'cash_transaction_payer_label',
    placeholder: 'cash_transaction_payer_placeholder',
    required: 'cash_transaction_payer_required_text',
  },
  outflow: {
    empty: 'cash_transaction_recipient_empty_text',
    label: 'cash_transaction_recipient_label',
    placeholder: 'cash_transaction_recipient_placeholder',
    required: 'cash_transaction_recipient_required_text',
  },
} as const);

/**
 * Creates complete Formik values from optional cash-transaction defaults,
 * preferring the selected account's currency when one can be resolved.
 */
function createInitialValues(
  initialValues: ICashTransactionFormValues | undefined,
  accounts: ILedgerAccountDto[],
  functionalCurrencyCode: string
): ICashTransactionFormValues {
  const selectedAccountCurrency = accounts.find(
    (account) => account.id === initialValues?.accountId
  )?.balance.currencyCode;

  return {
    accountId: initialValues?.accountId ?? '',
    categoryId: initialValues?.categoryId ?? '',
    amount: {
      amount: initialValues?.amount?.amount ?? Number.NaN,
      currencyCode:
        selectedAccountCurrency ??
        initialValues?.amount?.currencyCode ??
        functionalCurrencyCode,
      isMinorUnit: initialValues?.amount?.isMinorUnit ?? false,
    },
    date: initialValues?.date ?? dateUtils.formatDateForApi(new Date()),
    exchangeRate: initialValues?.exchangeRate ?? null,
    isItemized: initialValues?.isItemized ?? false,
    items: (initialValues?.items ?? []).map((item) => ({
      id: item.id,
      amount: {
        amount: item.amount.amount,
        currencyCode: selectedAccountCurrency ?? item.amount.currencyCode,
        isMinorUnit: item.amount.isMinorUnit,
      },
      accountId: item.accountId,
      description: item.description,
    })),
    counterparty: {
      id: initialValues?.counterparty?.id,
      name: initialValues?.counterparty?.name ?? '',
      type: initialValues?.counterparty?.type,
    },
    description: initialValues?.description ?? '',
    attachment: initialValues?.attachment ?? null,
  };
}

/**
 * Applies an account change to the form values, propagating its
 * currency to the transaction and itemized rows and clearing an unneeded rate.
 */
function updateAccount(
  values: ICashTransactionFormValues,
  accountId: string,
  currencyCode: string,
  functionalCurrencyCode: string
): ICashTransactionFormValues {
  const preserveExchangeRate =
    currencyCode === values.amount.currencyCode &&
    isExchangeRateRequired(currencyCode, functionalCurrencyCode);

  return {
    accountId,
    categoryId: values.categoryId,
    amount: {
      amount: values.amount.amount,
      currencyCode,
      isMinorUnit: values.amount.isMinorUnit,
    },
    date: values.date,
    exchangeRate: preserveExchangeRate ? values.exchangeRate : null,
    isItemized: values.isItemized,
    items: values.items.map((item) => ({
      id: item.id,
      amount: {
        amount: item.amount.amount,
        currencyCode,
        isMinorUnit: item.amount.isMinorUnit,
      },
      accountId: item.accountId,
      description: item.description,
    })),
    counterparty: values.counterparty,
    description: values.description,
    attachment: values.attachment,
  };
}

/**
 * Creates a blank itemized transaction row, optionally seeded with the current
 * single-entry amount and category.
 */
function createItem(
  id: string,
  currencyCode: string,
  amount = Number.NaN,
  accountId = ''
): IItemizedFieldValue {
  return {
    id,
    amount: {
      amount,
      currencyCode,
      isMinorUnit: false,
    },
    accountId,
    description: '',
  };
}

/**
 * Totals finite item amounts and rounds the result to avoid common
 * floating-point artifacts while incomplete amounts contribute zero.
 */
function getItemTotal(items: IItemizedFieldValue[]) {
  const total = items.reduce((sum, item) => {
    if (!Number.isFinite(item.amount.amount)) return sum;

    return sum + item.amount.amount;
  }, 0);

  return Math.round((total + Number.EPSILON) * 1_000_000) / 1_000_000;
}

/**
 * Determines whether a transaction requires conversion into the functional
 * currency, returning false when either currency is unavailable.
 */
function isExchangeRateRequired(
  accountCurrencyCode: string | null | undefined,
  functionalCurrencyCode: string | null | undefined
) {
  return Boolean(
    accountCurrencyCode &&
    functionalCurrencyCode &&
    accountCurrencyCode !== functionalCurrencyCode
  );
}

/**
 * Checks whether an official rate matches the selected currency pair and the
 * transaction date.
 */
function matchesOfficialRate(
  officialRate: IExchangeRate | undefined,
  baseCurrencyCode: string,
  targetCurrencyCode: string,
  date: string
) {
  return Boolean(
    officialRate?.baseCurrencyCode === baseCurrencyCode &&
    officialRate.targetCurrencyCode === targetCurrencyCode &&
    officialRate.asOf.slice(0, 10) === date
  );
}

/**
 * Produces submission-ready form values by trimming text, deriving itemized
 * totals, and resolving the applicable manual or official exchange rate.
 */
function normalizeValues(
  values: ICashTransactionFormValues,
  exchangeRateRequired: boolean,
  officialRate?: number
): ICashTransactionFormValues {
  const counterparty: IJournalCounterpartyReq = {
    name: values.counterparty.name.trim(),
  };

  if (values.counterparty.id !== undefined) {
    counterparty.id = values.counterparty.id;
  }

  if (values.counterparty.type !== undefined) {
    counterparty.type = values.counterparty.type;
  }

  const amount = values.isItemized
    ? getItemTotal(values.items)
    : values.amount.amount;

  let exchangeRate: ICashTransactionFormValues['exchangeRate'] = null;

  if (exchangeRateRequired) {
    if (
      values.exchangeRate !== null &&
      Number.isFinite(values.exchangeRate.value)
    ) {
      exchangeRate = values.exchangeRate;
    } else if (officialRate !== undefined) {
      exchangeRate = { value: officialRate, inverted: false };
    }
  }

  return {
    accountId: values.accountId,
    categoryId: values.categoryId,
    amount: {
      amount,
      currencyCode: values.amount.currencyCode,
      isMinorUnit: values.amount.isMinorUnit,
    },
    date: values.date,
    exchangeRate,
    isItemized: values.isItemized,
    items: values.items.map((item) => ({
      id: item.id,
      amount: {
        amount: item.amount.amount,
        currencyCode: item.amount.currencyCode,
        isMinorUnit: item.amount.isMinorUnit,
      },
      accountId: item.accountId,
      description: item.description.trim(),
    })),
    counterparty,
    description: values.description.trim(),
    attachment: values.attachment,
  };
}

/**
 * Resolves the selected account's balance currency, returning an empty string
 * when the account is not found.
 */
function getAccountCurrencyCode(
  accounts: ILedgerAccountDto[],
  accountId: string
) {
  return (
    accounts.find((account) => account.id === accountId)?.balance
      .currencyCode ?? ''
  );
}

/**
 * Resolves the complete counterparty copy contract for the transaction flow.
 */
function getCounterpartyTextKeys(variant?: UCashTransactionFormVariant) {
  if (!variant) return COUNTERPARTY_TEXT_KEYS.default;

  return COUNTERPARTY_TEXT_KEYS[variant];
}

const cashTransactionFormHelpers = Object.freeze({
  createInitialValues,
  createItem,
  getCounterpartyTextKeys,
  getItemTotal,
  isExchangeRateRequired,
  matchesOfficialRate,
  normalizeValues,
  updateAccount,
  getAccountCurrencyCode,
});

export default cashTransactionFormHelpers;
