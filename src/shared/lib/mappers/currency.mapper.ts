import { EExchangeRateType, type IExchangeRateDto } from '@/shared/lib/api/Api';
import { currencyService } from '@/shared/lib/services/currency.service';

type TExchangeRatePair = Pick<
  IExchangeRateDto,
  'baseCurrencyCode' | 'targetCurrencyCode'
>;

type TUserEnteredExchangeRateInput = Pick<
  IExchangeRateDto,
  'asOf' | 'baseCurrencyCode' | 'targetCurrencyCode'
> & {
  rate: string | number | null;
};

function isSamePair(left: TExchangeRatePair, right: TExchangeRatePair) {
  return (
    left.baseCurrencyCode === right.baseCurrencyCode &&
    left.targetCurrencyCode === right.targetCurrencyCode
  );
}

function isReversedPair(left: TExchangeRatePair, right: TExchangeRatePair) {
  return (
    left.baseCurrencyCode === right.targetCurrencyCode &&
    left.targetCurrencyCode === right.baseCurrencyCode
  );
}

function toCanonicalRate(
  rate: string | number | null,
  enteredPair: TExchangeRatePair,
  canonicalPair: TExchangeRatePair
) {
  const parsedRate = Number(rate);
  if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
    throw new RangeError('Exchange rate must be a positive finite number');
  }

  if (isSamePair(enteredPair, canonicalPair)) {
    return parsedRate;
  }

  if (isReversedPair(enteredPair, canonicalPair)) {
    const invertedRate = currencyService.invertRate(parsedRate);
    if (invertedRate !== undefined) {
      return invertedRate;
    }
  }

  throw new RangeError('Exchange rate currency pair is incompatible');
}

function toUserEnteredExchangeRate(
  input: TUserEnteredExchangeRateInput,
  enteredPair: TExchangeRatePair = input
): IExchangeRateDto {
  const canonicalPair: TExchangeRatePair = {
    baseCurrencyCode: input.baseCurrencyCode,
    targetCurrencyCode: input.targetCurrencyCode,
  };

  return {
    baseCurrencyCode: input.baseCurrencyCode,
    targetCurrencyCode: input.targetCurrencyCode,
    rate: toCanonicalRate(input.rate, enteredPair, canonicalPair),
    type: EExchangeRateType.Market,
    asOf: input.asOf,
    source: 'manual',
  };
}

export const currencyMapper = Object.freeze({
  toUserEnteredExchangeRate,
});
