import { drimsheetApi } from '@/shared/lib/api';
import type {
  IAccountingContextCreationReq,
  IAccountingEntity,
  IAccountingEntityCreationDto,
  IAccountingEntitySwitchReq,
  IAccountingEntityUpdateReq,
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
  async getEntityDetails(entityId: string) {
    return (
      await drimsheetApi.accounting.getActiveAccountingEntity({
        headers: { 'x-accounting-entity-id': entityId },
      })
    ).data;
  },

  async getFiscalYears(entityId: string) {
    return (
      await drimsheetApi.accounting.getFiscalYears({
        headers: { 'x-accounting-entity-id': entityId },
      })
    ).data;
  },

  async getFiscalYearContext(entityId: string, fiscalYearId: string) {
    const params = { headers: { 'x-accounting-entity-id': entityId } };

    const [accounting, reporting] = await Promise.all([
      drimsheetApi.accounting.getAccountingContext(fiscalYearId, params),
      drimsheetApi.accounting.getReportingContext(fiscalYearId, params),
    ]);

    const [accountingInterval, reportingInterval] = await Promise.all([
      accounting.data
        ? drimsheetApi.accounting.getAccountingInterval(fiscalYearId, params)
        : null,
      reporting.data
        ? drimsheetApi.accounting.getReportingInterval(fiscalYearId, params)
        : null,
    ]);

    return {
      accounting: accounting.data,
      reporting: reporting.data,
      accountingInterval: accountingInterval?.data ?? null,
      reportingInterval: reportingInterval?.data ?? null,
    };
  },

  async updateEntity(entityId: string, payload: IAccountingEntityUpdateReq) {
    const { data } = await drimsheetApi.accounting.updateAccountingEntity(
      payload,
      {
        headers: { 'x-accounting-entity-id': entityId },
      }
    );

    if (activeAccountingEntity?.id === entityId)
      setActiveAccountingEntity(data);

    return data;
  },

  async archiveEntity(entityId: string) {
    await drimsheetApi.accounting.archiveAccountingEntity({
      headers: { 'x-accounting-entity-id': entityId },
    });
  },

  async deleteEntity(entityId: string) {
    await drimsheetApi.accounting.deleteAccountingEntity({
      headers: { 'x-accounting-entity-id': entityId },
    });
  },

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
