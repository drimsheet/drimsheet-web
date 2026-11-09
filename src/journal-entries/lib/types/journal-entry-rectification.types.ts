import type {
  IJournalEntryMetaUpdateReq,
  IPaymentEntryReq,
  IReceiptEntryReq,
  ITransferEntryReq,
  IUpdateDraftPaymentReq,
  IUpdateDraftReceiptReq,
  IUpdateDraftTransferReq,
} from '@/shared/lib/api/Api';

type TMetaUpdate = {
  action: 'updateMeta';
  payload: IJournalEntryMetaUpdateReq;
};

export type UPaymentRectificationRequest =
  | TMetaUpdate
  | { action: 'updateDraft'; payload: IUpdateDraftPaymentReq }
  | { action: 'voidAndReplace'; payload: IPaymentEntryReq };

export type UReceiptRectificationRequest =
  | TMetaUpdate
  | { action: 'updateDraft'; payload: IUpdateDraftReceiptReq }
  | { action: 'voidAndReplace'; payload: IReceiptEntryReq };

export type UTransferRectificationRequest =
  | TMetaUpdate
  | { action: 'updateDraft'; payload: IUpdateDraftTransferReq }
  | { action: 'voidAndReplace'; payload: ITransferEntryReq };
