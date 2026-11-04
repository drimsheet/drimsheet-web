export type UTransactionCreationType = 'inflow' | 'outflow' | 'transfer';

export type UTransactionAccountField =
  | 'accountId'
  | 'sourceAccountId'
  | 'destinationAccountId';

export interface ITransactionContinuationSearchParams {
  continuationKey?: string;
  accountId?: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
}
