export type UTransactionCreationType = 'inflow' | 'outflow' | 'transfer';

export type UTransactionAccountField =
  | 'accountId'
  | 'sourceAccountId'
  | 'destinationAccountId';

export interface ITransactionContinuationSearchParams {
  continuationKey?: string;
  categoryId?: string;
  categoryItemId?: string;
  accountId?: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
}

export interface ITransactionContinuationItem {
  id: string;
  accountId: string;
}
