import { drimsheetApi } from '@/shared/lib/api';

export const bankService = {
  async getBanksByCountry(countryCode: string) {
    const response = await drimsheetApi.banks.getBanks({ countryCode });

    return response.data;
  },
};
