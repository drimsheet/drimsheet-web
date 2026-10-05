import { drimsheetApi } from '@/shared/lib/api';

export const jurisdictionService = {
  async getJurisdictions() {
    const { data } = await drimsheetApi.accounting.getJurisdictions();

    return data;
  },
};
