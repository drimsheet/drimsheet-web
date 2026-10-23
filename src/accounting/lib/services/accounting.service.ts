import { drimsheetApi } from '@/shared/lib/api';
import type {
  IAccountingContextCreationReq,
  IAccountingEntity,
  IAccountingEntityCreationDto,
  IAccountingEntitySwitchReq,
  IAccountingIntervalCreationReq,
  IFiscalYearCreationReq,
  IReportingContextCreationReq,
  IReportingIntervalCreationReq,
} from '@/shared/lib/api/Api';
import { parseApiError } from '@/shared/lib/api/errors';
import { storageService } from '@/shared/lib/services/storage.service';

let reloadAccountingEntityId = storageService.get('accountingEntityId');
storageService.set({ accountingEntityId: undefined });

let activeAccountingEntity: IAccountingEntity | undefined;

function setActiveAccountingEntity(accountingEntity: IAccountingEntity) {
  activeAccountingEntity = accountingEntity;
  reloadAccountingEntityId = undefined;
}

export const accountingService = {
  async createAccountingEntity(payload: IAccountingEntityCreationDto) {
    return (await drimsheetApi.accounting.createAccountingEntity(payload)).data;
  },

  async createFiscalYear(payload: IFiscalYearCreationReq) {
    return (await drimsheetApi.accounting.createFiscalYear(payload)).data;
  },

  async createAccountingInterval(payload: IAccountingIntervalCreationReq) {
    return (await drimsheetApi.accounting.createAccountingInterval(payload))
      .data;
  },

  async createAccountingContext(payload: IAccountingContextCreationReq) {
    return (await drimsheetApi.accounting.createAccountingContext(payload))
      .data;
  },

  async createReportingInterval(payload: IReportingIntervalCreationReq) {
    return (await drimsheetApi.accounting.createReportingInterval(payload))
      .data;
  },

  async createReportingContext(payload: IReportingContextCreationReq) {
    return (await drimsheetApi.accounting.createReportingContext(payload)).data;
  },

  async getAccountingContexts() {
    const { data } = await drimsheetApi.accounting.getAccountingContexts();

    return data;
  },

  async getReportingContexts() {
    const { data } = await drimsheetApi.accounting.getReportingContexts();

    return data;
  },

  getAccountingEntityId() {
    return activeAccountingEntity?.id ?? reloadAccountingEntityId;
  },

  removeAccountingEntity() {
    activeAccountingEntity = undefined;
    reloadAccountingEntityId = undefined;
    storageService.set({ accountingEntityId: undefined });
  },

  prepareAccountingEntityReload() {
    const accountingEntityId = this.getAccountingEntityId();
    if (!accountingEntityId) return;

    storageService.set({ accountingEntityId });
  },

  async getAccountingEntities() {
    const res = await drimsheetApi.accounting.getUserAccountingEntities();

    return res.data;
  },

  async getAccountingEntity() {
    try {
      const res = await drimsheetApi.accounting.getActiveAccountingEntity();
      setActiveAccountingEntity(res.data);

      return res.data;
    } catch (error) {
      if (parseApiError(error).code !== 404) throw error;

      const [firstAccountingEntity] = await this.getAccountingEntities();
      if (!firstAccountingEntity) throw error;

      return this.switchAccountingEntity({
        accountingEntityId: firstAccountingEntity.id,
      });
    }
  },

  async switchAccountingEntity(payload: IAccountingEntitySwitchReq) {
    const res = await drimsheetApi.accounting.switchAccountingEntity(payload);
    setActiveAccountingEntity(res.data);

    return res.data;
  },
};
