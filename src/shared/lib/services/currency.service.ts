import countries from '@/shared/configs/countries.json' with { type: 'json' };
import { drimsheetApi } from '@/shared/lib/api';
import type { IExchangeRateQueryParam } from '@/shared/lib/api/Api';

export const currencyService = {
  invertRate(rate: string | number | null | undefined): number | undefined {
    if (rate === null || rate === undefined || rate === '') return undefined;

    const parsedRate = Number(rate);
    if (!Number.isFinite(parsedRate) || parsedRate <= 0) return undefined;

    return 1 / parsedRate;
  },

  async getAll() {
    const res = await drimsheetApi.currencies.getAllCurrencies();

    return res.data;
  },

  async getExchangeRates(query: IExchangeRateQueryParam) {
    const res = await drimsheetApi.currencies.getExchangeRates(query);

    return res.data;
  },

  getJurisdictionLocale(currencyCode: string) {
    const jurisdiction = countries.find(
      (country) => country.currencyCode === currencyCode
    );

    return jurisdiction?.locale ?? 'en-NG';
  },
};
