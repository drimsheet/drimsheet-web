import type {
  IAccountingEntity,
  IAccountingEntityUpdateReq,
} from '@/shared/lib/api/Api';

export const legalEntityMapper = Object.freeze({
  toUpdateDto(
    values: Pick<IAccountingEntity, 'name'>
  ): IAccountingEntityUpdateReq {
    return { name: values.name.trim() };
  },
});
