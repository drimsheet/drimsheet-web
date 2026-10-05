import type { IItemizedFieldValue } from '@/journal-entries/components/itemized-fields';
import type {
  IExchangeRate,
  ILedgerAccountDto,
  IMoneyDto,
} from '@/shared/lib/api/Api';
import { currencyService } from '@/shared/lib/services/currency.service';
import { dateUtils } from '@/shared/lib/utils/date';
import type {
  ICashTransferFormInitialValues,
  ICashTransferFormValues,
} from './types';

const PRECISION_FACTOR = 1_000_000;
const BALANCE_TOLERANCE = 1 / PRECISION_FACTOR;

function round(value: number) {
  if (!Number.isFinite(value)) return Number.NaN;

  return (
    Math.round((value + Number.EPSILON) * PRECISION_FACTOR) / PRECISION_FACTOR
  );
}

function updateMoney(
  value: IMoneyDto,
  updates: Partial<Pick<IMoneyDto, 'amount' | 'currencyCode'>>
): IMoneyDto {
  return {
    amount: updates.amount ?? value.amount,
    currencyCode: updates.currencyCode ?? value.currencyCode,
    isMinorUnit: value.isMinorUnit,
  };
}

function getAccountCurrencyCode(
  accounts: ILedgerAccountDto[],
  accountId: string
) {
  return (
    accounts.find((account) => account.id === accountId)?.balance
      .currencyCode ?? ''
  );
}

function getItemTotal(items: IItemizedFieldValue[]) {
  return round(
    items.reduce((sum, item) => {
      if (!Number.isFinite(item.amount.amount)) return sum;

      return sum + item.amount.amount;
    }, 0)
  );
}

function getChargeTotal(values: ICashTransferFormValues) {
  return values.isItemized ? getItemTotal(values.items) : 0;
}

function isExchangeRateRequired(
  sourceCurrencyCode: string | null | undefined,
  destinationCurrencyCode: string | null | undefined
) {
  return Boolean(
    sourceCurrencyCode &&
    destinationCurrencyCode &&
    sourceCurrencyCode !== destinationCurrencyCode
  );
}

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

function getEffectiveExchangeRate(
  values: ICashTransferFormValues,
  officialExchangeRate?: IExchangeRate
) {
  const manualRate = values.exchangeRate?.value;
  if (
    manualRate !== undefined &&
    Number.isFinite(manualRate) &&
    manualRate > 0
  ) {
    return values.exchangeRate?.inverted
      ? currencyService.invertRate(manualRate)
      : manualRate;
  }

  const officialRateMatches = matchesOfficialRate(
    officialExchangeRate,
    values.amountSent.currencyCode,
    values.amountReceived.currencyCode,
    values.date
  );

  return officialRateMatches ? officialExchangeRate?.rate : undefined;
}

function calculateAmountReceived(
  amountSent: number,
  exchangeRate: number | undefined,
  chargeTotal: number,
  exchangeRateRequired: boolean
) {
  if (!Number.isFinite(amountSent)) return Number.NaN;

  if (!exchangeRateRequired) return round(amountSent - chargeTotal);

  if (!exchangeRate || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    return Number.NaN;
  }

  return round(amountSent * exchangeRate - chargeTotal);
}

function calculateExchangeRate(
  amountSent: number,
  amountReceived: number,
  chargeTotal: number
) {
  const destinationTotal = amountReceived + chargeTotal;
  if (
    !Number.isFinite(amountSent) ||
    !Number.isFinite(destinationTotal) ||
    amountSent <= 0 ||
    destinationTotal <= 0
  ) {
    return null;
  }

  return round(destinationTotal / amountSent);
}

function createInitialValues(
  initialValues: ICashTransferFormInitialValues | undefined,
  sourceAccounts: ILedgerAccountDto[],
  destinationAccounts: ILedgerAccountDto[],
  functionalCurrencyCode: string
): ICashTransferFormValues {
  const sourceCurrencyCode =
    getAccountCurrencyCode(
      sourceAccounts,
      initialValues?.sourceAccountId ?? ''
    ) ||
    initialValues?.amountSent?.currencyCode ||
    functionalCurrencyCode;

  const destinationCurrencyCode =
    getAccountCurrencyCode(
      destinationAccounts,
      initialValues?.destinationAccountId ?? ''
    ) ||
    initialValues?.amountReceived?.currencyCode ||
    sourceCurrencyCode;

  const amountSent = initialValues?.amountSent?.amount ?? Number.NaN;
  const exchangeRate = initialValues?.exchangeRate ?? null;

  const items = (initialValues?.items ?? []).map((item) => ({
    id: item.id,
    amount: {
      amount: item.amount.amount,
      currencyCode: destinationCurrencyCode,
      isMinorUnit: item.amount.isMinorUnit,
    },
    accountId: item.accountId,
    description: item.description,
  }));

  const isItemized = initialValues?.isItemized ?? false;
  const chargeTotal = isItemized ? getItemTotal(items) : 0;

  const exchangeRateRequired = isExchangeRateRequired(
    sourceCurrencyCode,
    destinationCurrencyCode
  );

  const effectiveExchangeRate = exchangeRate?.inverted
    ? currencyService.invertRate(exchangeRate.value)
    : exchangeRate?.value;

  const derivedAmountReceived = calculateAmountReceived(
    amountSent,
    effectiveExchangeRate !== null &&
      effectiveExchangeRate !== undefined &&
      Number.isFinite(effectiveExchangeRate) &&
      effectiveExchangeRate > 0
      ? effectiveExchangeRate
      : undefined,
    chargeTotal,
    exchangeRateRequired
  );

  return {
    sourceAccountId: initialValues?.sourceAccountId ?? '',
    destinationAccountId: initialValues?.destinationAccountId ?? '',
    amountSent: {
      amount: amountSent,
      currencyCode: sourceCurrencyCode,
      isMinorUnit: initialValues?.amountSent?.isMinorUnit ?? false,
    },
    amountReceived: {
      amount: initialValues?.amountReceived?.amount ?? derivedAmountReceived,
      currencyCode: destinationCurrencyCode,
      isMinorUnit: initialValues?.amountReceived?.isMinorUnit ?? false,
    },
    date: initialValues?.date ?? dateUtils.formatDateForApi(new Date()),
    exchangeRate: exchangeRateRequired ? exchangeRate : null,
    isItemized,
    items,
    description: initialValues?.description ?? '',
    attachment: initialValues?.attachment ?? null,
  };
}

function updateSourceAccount(
  values: ICashTransferFormValues,
  sourceAccountId: string,
  sourceCurrencyCode: string
): ICashTransferFormValues {
  const exchangeRateRequired = isExchangeRateRequired(
    sourceCurrencyCode,
    values.amountReceived.currencyCode
  );

  const nextValues: ICashTransferFormValues = {
    ...values,
    sourceAccountId,
    amountSent: updateMoney(values.amountSent, {
      currencyCode: sourceCurrencyCode,
    }),
    exchangeRate: null,
  };

  return {
    ...nextValues,
    amountReceived: updateMoney(nextValues.amountReceived, {
      amount: calculateAmountReceived(
        nextValues.amountSent.amount,
        undefined,
        getChargeTotal(nextValues),
        exchangeRateRequired
      ),
    }),
  };
}

function updateDestinationAccount(
  values: ICashTransferFormValues,
  destinationAccountId: string,
  destinationCurrencyCode: string
): ICashTransferFormValues {
  const items = values.items.map((item) => ({
    id: item.id,
    amount: {
      amount: item.amount.amount,
      currencyCode: destinationCurrencyCode,
      isMinorUnit: item.amount.isMinorUnit,
    },
    accountId: item.accountId,
    description: item.description,
  }));

  const exchangeRateRequired = isExchangeRateRequired(
    values.amountSent.currencyCode,
    destinationCurrencyCode
  );

  const nextValues: ICashTransferFormValues = {
    ...values,
    destinationAccountId,
    amountReceived: updateMoney(values.amountReceived, {
      currencyCode: destinationCurrencyCode,
    }),
    exchangeRate: null,
    items,
  };

  return {
    ...nextValues,
    amountReceived: updateMoney(nextValues.amountReceived, {
      amount: calculateAmountReceived(
        nextValues.amountSent.amount,
        undefined,
        getChargeTotal(nextValues),
        exchangeRateRequired
      ),
    }),
  };
}

function updateAmountSent(
  values: ICashTransferFormValues,
  amountSent: IMoneyDto,
  effectiveExchangeRate?: number
): ICashTransferFormValues {
  const exchangeRateRequired = isExchangeRateRequired(
    amountSent.currencyCode,
    values.amountReceived.currencyCode
  );

  return {
    ...values,
    amountSent,
    amountReceived: updateMoney(values.amountReceived, {
      amount: calculateAmountReceived(
        amountSent.amount,
        effectiveExchangeRate,
        getChargeTotal(values),
        exchangeRateRequired
      ),
    }),
  };
}

function updateAmountReceived(
  values: ICashTransferFormValues,
  amountReceived: IMoneyDto
): ICashTransferFormValues {
  if (
    !isExchangeRateRequired(
      values.amountSent.currencyCode,
      amountReceived.currencyCode
    )
  ) {
    return {
      ...values,
      amountReceived,
      exchangeRate: null,
    };
  }

  const canonicalExchangeRate = calculateExchangeRate(
    values.amountSent.amount,
    amountReceived.amount,
    getChargeTotal(values)
  );

  const inverted = values.exchangeRate?.inverted ?? false;

  const displayedExchangeRate = inverted
    ? currencyService.invertRate(canonicalExchangeRate)
    : canonicalExchangeRate;

  return {
    ...values,
    amountReceived,
    exchangeRate:
      displayedExchangeRate === null || displayedExchangeRate === undefined
        ? null
        : { value: displayedExchangeRate, inverted },
  };
}

function updateExchangeRate(
  values: ICashTransferFormValues,
  exchangeRate: ICashTransferFormValues['exchangeRate']
): ICashTransferFormValues {
  const effectiveExchangeRate = exchangeRate?.inverted
    ? currencyService.invertRate(exchangeRate.value)
    : exchangeRate?.value;

  return {
    ...values,
    exchangeRate,
    amountReceived: updateMoney(values.amountReceived, {
      amount: calculateAmountReceived(
        values.amountSent.amount,
        effectiveExchangeRate !== null &&
          effectiveExchangeRate !== undefined &&
          Number.isFinite(effectiveExchangeRate) &&
          effectiveExchangeRate > 0
          ? effectiveExchangeRate
          : undefined,
        getChargeTotal(values),
        true
      ),
    }),
  };
}

function updateItems(
  values: ICashTransferFormValues,
  items: IItemizedFieldValue[],
  effectiveExchangeRate?: number
): ICashTransferFormValues {
  const nextValues = { ...values, items };

  const exchangeRateRequired = isExchangeRateRequired(
    values.amountSent.currencyCode,
    values.amountReceived.currencyCode
  );

  return {
    ...nextValues,
    amountReceived: updateMoney(values.amountReceived, {
      amount: calculateAmountReceived(
        values.amountSent.amount,
        effectiveExchangeRate,
        getItemTotal(items),
        exchangeRateRequired
      ),
    }),
  };
}

function createItem(id: string, currencyCode: string): IItemizedFieldValue {
  return {
    id,
    amount: {
      amount: Number.NaN,
      currencyCode,
      isMinorUnit: false,
    },
    accountId: '',
    description: '',
  };
}

function isBalanced(
  values: ICashTransferFormValues,
  officialExchangeRate?: IExchangeRate
) {
  const amountSent = values.amountSent.amount;

  const destinationTotal = round(
    values.amountReceived.amount + getChargeTotal(values)
  );

  if (!Number.isFinite(amountSent) || !Number.isFinite(destinationTotal)) {
    return false;
  }

  const exchangeRateRequired = isExchangeRateRequired(
    values.amountSent.currencyCode,
    values.amountReceived.currencyCode
  );

  const exchangeRate = getEffectiveExchangeRate(values, officialExchangeRate);

  const expectedDestinationTotal = exchangeRateRequired
    ? round(amountSent * (exchangeRate ?? Number.NaN))
    : amountSent;

  return (
    Number.isFinite(expectedDestinationTotal) &&
    Math.abs(destinationTotal - expectedDestinationTotal) <= BALANCE_TOLERANCE
  );
}

function normalizeValues(
  values: ICashTransferFormValues,
  officialExchangeRate?: IExchangeRate
): ICashTransferFormValues {
  const exchangeRateRequired = isExchangeRateRequired(
    values.amountSent.currencyCode,
    values.amountReceived.currencyCode
  );

  const effectiveExchangeRate = getEffectiveExchangeRate(
    values,
    officialExchangeRate
  );

  const hasManualExchangeRate =
    values.exchangeRate !== null && Number.isFinite(values.exchangeRate.value);

  let exchangeRate: ICashTransferFormValues['exchangeRate'] = null;

  if (hasManualExchangeRate) {
    exchangeRate = values.exchangeRate;
  } else if (effectiveExchangeRate !== undefined) {
    exchangeRate = { value: effectiveExchangeRate, inverted: false };
  }

  return {
    sourceAccountId: values.sourceAccountId,
    destinationAccountId: values.destinationAccountId,
    amountSent: {
      amount: values.amountSent.amount,
      currencyCode: values.amountSent.currencyCode,
      isMinorUnit: values.amountSent.isMinorUnit,
    },
    amountReceived: {
      amount: values.amountReceived.amount,
      currencyCode: values.amountReceived.currencyCode,
      isMinorUnit: values.amountReceived.isMinorUnit,
    },
    date: values.date,
    exchangeRate: exchangeRateRequired ? exchangeRate : null,
    isItemized: values.isItemized,
    items: values.isItemized
      ? values.items.map((item) => ({
          id: item.id,
          amount: {
            amount: item.amount.amount,
            currencyCode: item.amount.currencyCode,
            isMinorUnit: item.amount.isMinorUnit,
          },
          accountId: item.accountId,
          description: item.description.trim(),
        }))
      : [],
    description: values.description.trim(),
    attachment: values.attachment,
  };
}

const cashTransferFormHelpers = Object.freeze({
  calculateAmountReceived,
  calculateExchangeRate,
  createInitialValues,
  createItem,
  getAccountCurrencyCode,
  getChargeTotal,
  getEffectiveExchangeRate,
  getItemTotal,
  isBalanced,
  isExchangeRateRequired,
  matchesOfficialRate,
  normalizeValues,
  round,
  updateAmountReceived,
  updateAmountSent,
  updateDestinationAccount,
  updateExchangeRate,
  updateItems,
  updateSourceAccount,
});

export default cashTransferFormHelpers;
