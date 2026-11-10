export interface IStorageScope {
  userId: string;
  accountingEntityId: string;
}

export interface IStorageRecord<T = unknown> {
  id: string;
  value: T;
  expiresAt?: number;
}
