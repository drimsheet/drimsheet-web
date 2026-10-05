import { drimsheetApi } from '@/shared/lib/api';
import type {
  IAccountingEntity,
  IAccountingEntityCreationDto,
  IAccountingEntitySwitchReq,
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

  async createAccountingEntity(payload: IAccountingEntityCreationDto) {
    const { data } =
      await drimsheetApi.accounting.createAccountingEntity(payload);

    setActiveAccountingEntity(data);

    return data;
  },
};
