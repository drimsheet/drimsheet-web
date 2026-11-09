import { usePermittedPostingAccounts } from '@/account/hooks/use-permitted-posting-accounts';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { CashTransferFormContainer } from '@/journal-entries/components/cash-transfer-form';
import { useCreateTransfer } from '@/journal-entries/hooks/use-create-transfer';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useExchangeRates } from '@/shared/hooks/use-exchange-rates';
import { drimsheetApi } from '@/shared/lib/api';
import type {
  IJournalEntryListDto,
  ILedgerAccountDto,
} from '@/shared/lib/api/Api';
import { fileUploadService } from '@/shared/lib/services/file-upload.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render as renderComponent,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { toast } from 'sonner';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const onSuccess = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

vi.mock('@/account/hooks/use-permitted-posting-accounts');
vi.mock('@/accounting/hooks/use-accounting-entity');
vi.mock('@/journal-entries/hooks/use-create-transfer');
vi.mock('@/shared/hooks/use-api-error-handler');
vi.mock('@/shared/hooks/use-exchange-rates');
vi.mock('@/shared/lib/services/file-upload.service', () => ({
  fileUploadService: { uploadFile: vi.fn() },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const sourceAccounts = [
  {
    id: 'source-bank',
    code: '1000',
    name: 'Operating account',
    type: 'asset',
    subType: 'cash_and_cash_equivalent',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
] as ILedgerAccountDto[];

const destinationAccounts = [
  {
    id: 'destination-cash',
    code: '1010',
    name: 'Petty cash',
    type: 'asset',
    subType: 'cash_and_cash_equivalent',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
  {
    id: 'bank-fees',
    code: '6000',
    name: 'Bank fees',
    type: 'expense',
    subType: 'bank_charge',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
] as ILedgerAccountDto[];

const createTransfer = vi.fn();
const handleApiError = vi.fn();

const timestamp = '2026-09-21T10:00:00.000Z';

const journalEntry = {
  id: 'transfer-entry',
  accountingEntityId: 'entity-1',
  sourceType: 'transfer',
  memo: 'Original memo',
  status: 'posted',
  effectiveDate: '2026-09-21',
  postedAt: timestamp,
  voidedAt: null,
  voidingEntryId: null,
  createdBy: 'user-1',
  createdAt: timestamp,
  updatedAt: timestamp,
  attachments: [],
  lines: (
    [
      ['source-line', 'source-bank', 'Operating account', 'credit', 250],
      ['destination-line', 'destination-cash', 'Petty cash', 'debit', 240],
      ['charge-line', 'bank-fees', 'Bank fees', 'debit', 10],
    ] as const
  ).map(([id, accountId, name, side, amount], index) => ({
    id,
    entryId: 'transfer-entry',
    account: { id: accountId, name },
    counterparty: null,
    sequenceOrder: index + 1,
    amount: { amount, currencyCode: 'NGN', isMinorUnit: false },
    exchangeRate: null,
    functionalAmount: { amount, currencyCode: 'NGN', isMinorUnit: false },
    side,
    description: index === 2 ? 'Bank charge' : 'Original memo',
    createdAt: timestamp,
    updatedAt: timestamp,
  })),
} satisfies IJournalEntryListDto;

const updateDraft = vi.spyOn(
  drimsheetApi.journalEntries,
  'updateDraftTransfer'
);

const voidAndReplace = vi.spyOn(
  drimsheetApi.journalEntries,
  'voidAndReplaceTransfer'
);

const updateMeta = vi.spyOn(
  drimsheetApi.journalEntries,
  'updateJournalEntryMeta'
);

function render(element: ReactElement) {
  const queryClient = new QueryClient();

  return renderComponent(element, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('CashTransferFormContainer', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.hasPointerCapture = vi.fn(
      () => false
    ) as unknown as typeof window.HTMLElement.prototype.hasPointerCapture;
    window.HTMLElement.prototype.releasePointerCapture =
      vi.fn() as unknown as typeof window.HTMLElement.prototype.releasePointerCapture;
    window.HTMLElement.prototype.setPointerCapture =
      vi.fn() as unknown as typeof window.HTMLElement.prototype.setPointerCapture;
    window.HTMLElement.prototype.scrollIntoView =
      vi.fn() as unknown as typeof window.HTMLElement.prototype.scrollIntoView;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    updateDraft.mockResolvedValue({ data: { id: journalEntry.id } } as never);
    updateMeta.mockResolvedValue({ data: { id: journalEntry.id } } as never);
    voidAndReplace.mockResolvedValue({ data: { id: 'replacement' } } as never);
    vi.mocked(usePermittedPostingAccounts).mockImplementation(
      (query) =>
        ({
          data: {
            data:
              query.side === 'source' ? sourceAccounts : destinationAccounts,
          },
          isPending: false,
        }) as never
    );
    vi.mocked(useAccountingEntity).mockReturnValue({
      data: { functionalCurrencyCode: 'NGN' },
      isPending: false,
    } as never);
    vi.mocked(useExchangeRates).mockReturnValue({ data: undefined } as never);
    vi.mocked(useCreateTransfer).mockReturnValue({
      mutateAsync: createTransfer,
      isPending: false,
    } as never);
    vi.mocked(useApiErrorHandler).mockReturnValue(handleApiError);
    vi.mocked(fileUploadService.uploadFile).mockResolvedValue('attachment-ref');
    createTransfer.mockResolvedValue(undefined);
  });

  it('renders the loading state while required data is pending', () => {
    vi.mocked(useAccountingEntity).mockReturnValue({
      data: undefined,
      isPending: true,
    } as never);

    render(<CashTransferFormContainer onSuccess={onSuccess} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading transfer form'
    );
  });

  it('uploads both selected receipts and creates a mapped transfer', async () => {
    const user = userEvent.setup();

    const attachment = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    const secondAttachment = new File(['other receipt'], 'other.pdf', {
      type: 'application/pdf',
    });

    vi.mocked(fileUploadService.uploadFile)
      .mockResolvedValueOnce('attachment-ref')
      .mockResolvedValueOnce('other-ref');

    render(<CashTransferFormContainer onSuccess={onSuccess} />);

    await user.click(screen.getByRole('combobox', { name: 'Source account' }));
    await user.click(
      screen.getByRole('option', { name: /^Operating account/ })
    );
    await user.click(
      screen.getByRole('combobox', { name: 'Destination account' })
    );
    await user.click(screen.getByRole('option', { name: /^Petty cash/ }));
    await user.type(screen.getByLabelText('Amount sent'), '250');
    await user.upload(screen.getByLabelText('Attach receipt'), [
      attachment,
      secondAttachment,
    ]);
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(attachment);
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(
        secondAttachment
      );
      expect(createTransfer).toHaveBeenCalledWith(
        expect.objectContaining({
          attachmentReferences: ['attachment-ref', 'other-ref'],
          sourceLine: expect.objectContaining({
            accountId: 'source-bank',
            amount: expect.objectContaining({ amount: 250 }),
            sequenceOrder: 1,
          }),
          destinationLine: expect.objectContaining({
            accountId: 'destination-cash',
            amount: expect.objectContaining({ amount: 250 }),
            sequenceOrder: 2,
          }),
          chargeLines: [],
        })
      );
    });
    expect(usePermittedPostingAccounts).toHaveBeenCalledWith(
      expect.objectContaining({ sourceType: 'transfer', side: 'source' })
    );
    expect(usePermittedPostingAccounts).toHaveBeenCalledWith(
      expect.objectContaining({ sourceType: 'transfer', side: 'destination' })
    );
    expect(toast.success).toHaveBeenCalledWith('Transfer created successfully');
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(handleApiError).not.toHaveBeenCalled();
  });

  it('creates a draft transfer without a posting timestamp', async () => {
    const user = userEvent.setup();
    render(<CashTransferFormContainer onSuccess={onSuccess} />);

    await user.click(screen.getByRole('combobox', { name: 'Source account' }));
    await user.click(
      screen.getByRole('option', { name: /^Operating account/ })
    );
    await user.click(
      screen.getByRole('combobox', { name: 'Destination account' })
    );
    await user.click(screen.getByRole('option', { name: /^Petty cash/ }));
    await user.type(screen.getByLabelText('Amount sent'), '250');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() => {
      expect(createTransfer).toHaveBeenCalledWith(
        expect.objectContaining({ postedAt: null })
      );
    });
    expect(toast.success).toHaveBeenCalledWith('Draft saved successfully');
    expect(onSuccess).toHaveBeenCalledOnce();
  });
  it('saves edits to the transfer draft', async () => {
    const user = userEvent.setup();
    const draft = { ...journalEntry, status: 'draft' as const, postedAt: null };

    render(
      <CashTransferFormContainer journalEntry={draft} onSuccess={onSuccess} />
    );

    const description = screen.getByLabelText('Description');
    await user.clear(description);
    await user.type(description, 'Saved memo');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(toast.success).toHaveBeenCalledWith('Draft saved successfully');
    expect(updateDraft).toHaveBeenCalledWith(
      journalEntry.id,
      expect.objectContaining({
        memo: 'Saved memo',
        sourceLine: expect.objectContaining({ id: 'source-line' }),
        destinationLine: expect.objectContaining({ id: 'destination-line' }),
        chargeLines: [expect.objectContaining({ id: 'charge-line' })],
      })
    );
    expect(updateDraft.mock.calls[0][1]).not.toHaveProperty('postedAt');
    expect(updateDraft.mock.calls[0][1]).not.toHaveProperty('attachments');
    expect(updateDraft).toHaveBeenCalledOnce();
  });

  it('uses metadata update when only the transfer description changes', async () => {
    const user = userEvent.setup();
    render(
      <CashTransferFormContainer
        journalEntry={journalEntry}
        onSuccess={onSuccess}
      />
    );

    const description = screen.getByLabelText('Description');
    await user.clear(description);
    await user.type(description, 'Updated memo');
    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() =>
      expect(updateMeta).toHaveBeenCalledWith(
        journalEntry.id,
        expect.objectContaining({
          header: { memo: 'Updated memo' },
        })
      )
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(voidAndReplace).not.toHaveBeenCalled();
  });

  it('uses metadata update for an existing charge description alone', async () => {
    const user = userEvent.setup();
    render(
      <CashTransferFormContainer
        journalEntry={journalEntry}
        onSuccess={onSuccess}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Edit item 1' }));
    const description = screen.getByDisplayValue('Bank charge');
    await user.clear(description);
    await user.type(description, 'Updated bank charge');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() =>
      expect(updateMeta).toHaveBeenCalledWith(journalEntry.id, {
        lines: [{ id: 'charge-line', description: 'Updated bank charge' }],
      })
    );
    expect(voidAndReplace).not.toHaveBeenCalled();
  });

  it('updates metadata when only transfer attachments change', async () => {
    const user = userEvent.setup();

    const savedReceipt = {
      name: 'saved.pdf',
      url: 'https://example.com/saved.pdf',
      size: 10,
      type: 'application/pdf',
    };

    const newReceipt = new File(['receipt'], 'new.pdf', {
      type: 'application/pdf',
    });

    render(
      <CashTransferFormContainer
        journalEntry={{ ...journalEntry, attachments: [savedReceipt] }}
        onSuccess={onSuccess}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Remove file saved.pdf' })
    );
    await user.upload(screen.getByLabelText('Attach receipt'), newReceipt);
    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() =>
      expect(updateMeta).toHaveBeenCalledWith(journalEntry.id, {
        attachments: { add: ['attachment-ref'], remove: [savedReceipt.url] },
      })
    );
    expect(voidAndReplace).not.toHaveBeenCalled();
  });

  it('sends the kept and new receipts when replacing a posted transfer', async () => {
    const user = userEvent.setup();

    const keptReceipt = {
      name: 'kept.pdf',
      url: 'https://example.com/kept.pdf',
      size: 10,
      type: 'application/pdf',
    };

    const removedReceipt = {
      ...keptReceipt,
      name: 'removed.pdf',
      url: 'https://example.com/removed.pdf',
    };

    const newReceipt = new File(['receipt'], 'new.pdf', {
      type: 'application/pdf',
    });

    render(
      <CashTransferFormContainer
        journalEntry={{
          ...journalEntry,
          attachments: [keptReceipt, removedReceipt],
        }}
        onSuccess={onSuccess}
      />
    );

    const amount = screen.getByLabelText('Amount sent');
    await user.clear(amount);
    await user.type(amount, '300');
    await user.click(
      screen.getByRole('button', { name: 'Remove file removed.pdf' })
    );
    await user.upload(screen.getByLabelText('Attach receipt'), newReceipt);
    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() =>
      expect(voidAndReplace).toHaveBeenCalledWith(
        journalEntry.id,
        expect.objectContaining({
          attachmentReferences: [keptReceipt.url, 'attachment-ref'],
          postedAt: timestamp,
          sourceLine: expect.objectContaining({
            amount: expect.objectContaining({ amount: 300 }),
          }),
          chargeLines: [
            expect.objectContaining({
              accountId: 'bank-fees',
              amount: expect.objectContaining({ amount: 10 }),
            }),
          ],
        })
      )
    );
    expect(fileUploadService.uploadFile).toHaveBeenCalledExactlyOnceWith(
      newReceipt
    );
    expect(updateMeta).not.toHaveBeenCalled();
  });
});
