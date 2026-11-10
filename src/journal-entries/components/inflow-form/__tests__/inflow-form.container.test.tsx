import { usePermittedPostingAccounts } from '@/account/hooks/use-permitted-posting-accounts';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { useCounterparties } from '@/counterparty/hooks/use-counterparties';
import { InflowFormContainer } from '@/journal-entries/components/inflow-form';
import { useCreateReceipt } from '@/journal-entries/hooks/use-create-receipt';
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
vi.mock('@/counterparty/hooks/use-counterparties');
vi.mock('@/journal-entries/hooks/use-create-receipt');
vi.mock('@/shared/hooks/use-api-error-handler');
vi.mock('@/shared/hooks/use-exchange-rates');
vi.mock('@/shared/lib/services/file-upload.service', () => ({
  fileUploadService: {
    uploadFile: vi.fn(),
  },
}));
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const accounts = [
  {
    id: 'bank-account',
    code: '1000',
    name: 'Operating account',
    type: 'asset',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
] as unknown as ILedgerAccountDto[];

const categories = [
  {
    id: 'sales-revenue',
    code: '4000',
    name: 'Sales revenue',
    type: 'revenue',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
] as unknown as ILedgerAccountDto[];

const createReceipt = vi.fn();
const handleApiError = vi.fn();

const timestamp = '2026-09-21T10:00:00.000Z';

const journalEntry = {
  id: 'receipt-entry',
  accountingEntityId: 'entity-1',
  sourceType: 'receipt',
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
      ['source-line', 'sales-revenue', 'Sales revenue', 'credit', 250],
      ['destination-line', 'bank-account', 'Operating account', 'debit', 250],
    ] as const
  ).map(([id, accountId, name, side, amount], index) => ({
    id,
    entryId: 'receipt-entry',
    account: { id: accountId, name },
    counterparty: { id: 'party-1', name: 'Acme', status: 'active' },
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

const updateDraft = vi.spyOn(drimsheetApi.journalEntries, 'updateDraftReceipt');

const voidAndReplace = vi.spyOn(
  drimsheetApi.journalEntries,
  'voidAndReplaceReceipt'
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

describe('InflowFormContainer', () => {
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

    vi.mocked(usePermittedPostingAccounts).mockImplementation((query) => {
      const data = query.side === 'destination' ? accounts : categories;

      return { data: { data }, isPending: false } as never;
    });
    vi.mocked(useAccountingEntity).mockReturnValue({
      data: { functionalCurrencyCode: 'NGN' },
      isPending: false,
    } as never);
    vi.mocked(useCounterparties).mockReturnValue({
      data: { data: [{ id: 'party-1', name: 'Acme' }] },
      isPending: false,
    } as never);
    vi.mocked(useExchangeRates).mockReturnValue({ data: undefined } as never);
    vi.mocked(useCreateReceipt).mockReturnValue({
      mutateAsync: createReceipt,
      isPending: false,
    } as never);
    vi.mocked(useApiErrorHandler).mockReturnValue(handleApiError);
    vi.mocked(fileUploadService.uploadFile).mockResolvedValue('attachment-ref');
    createReceipt.mockResolvedValue(undefined);
  });

  it('omits counterparty creation when editing an existing transaction', async () => {
    const user = userEvent.setup();
    render(
      <InflowFormContainer
        journalEntry={journalEntry}
        onAddCounterparty={vi.fn()}
        onSuccess={onSuccess}
      />
    );
    const counterparty = screen.getByRole('combobox', { name: 'Payer' });
    await user.clear(counterparty);
    await user.type(counterparty, 'New person');
    expect(
      screen.queryByRole('option', { name: 'Add new counterparty' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/will be created as an individual/)
    ).not.toBeInTheDocument();
  });

  it('renders the inflow loading state while prerequisite data is pending', () => {
    vi.mocked(useAccountingEntity).mockReturnValue({
      data: undefined,
      isPending: true,
    } as never);

    render(<InflowFormContainer onSuccess={onSuccess} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading transaction form'
    );
  });

  it('maps neutral form values to a receipt request after uploading three attachments', async () => {
    const user = userEvent.setup();

    const attachments = ['receipt.pdf', 'invoice.pdf', 'statement.pdf'].map(
      (name) => new File(['receipt'], name, { type: 'application/pdf' })
    );

    vi.mocked(fileUploadService.uploadFile).mockImplementation(
      async (file) => `ref-${file.name}`
    );

    render(<InflowFormContainer onSuccess={onSuccess} />);

    await user.click(screen.getByRole('combobox', { name: 'Account' }));
    await user.click(
      screen.getByRole('option', { name: /^Operating account/ })
    );
    await user.type(screen.getByLabelText('Amount'), '250');
    await user.click(screen.getByRole('combobox', { name: 'Category' }));
    await user.click(screen.getByRole('option', { name: 'Sales revenue' }));
    await user.type(screen.getByRole('combobox', { name: 'Payer' }), 'Acme');
    await user.click(screen.getByRole('option', { name: 'Acme' }));
    const picker = screen.getByLabelText('Attach file');
    await user.upload(picker, attachments.slice(0, 2));
    await user.upload(picker, attachments[2]);
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(fileUploadService.uploadFile).toHaveBeenCalledTimes(3);
      expect(createReceipt).toHaveBeenCalledWith(
        expect.objectContaining({
          attachmentReferences: [
            'ref-receipt.pdf',
            'ref-invoice.pdf',
            'ref-statement.pdf',
          ],
          destinationLine: expect.objectContaining({
            accountId: 'bank-account',
            counterpartyId: 'party-1',
          }),
          sourceLines: [
            expect.objectContaining({
              accountId: 'sales-revenue',
              counterpartyId: 'party-1',
            }),
          ],
        })
      );
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Transaction was created successfully.'
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(handleApiError).not.toHaveBeenCalled();
  });

  it('creates a draft receipt without a posting timestamp', async () => {
    const user = userEvent.setup();
    render(<InflowFormContainer onSuccess={onSuccess} />);

    await user.click(screen.getByRole('combobox', { name: 'Account' }));
    await user.click(
      screen.getByRole('option', { name: /^Operating account/ })
    );
    await user.type(screen.getByLabelText('Amount'), '250');
    await user.click(screen.getByRole('combobox', { name: 'Category' }));
    await user.click(screen.getByRole('option', { name: 'Sales revenue' }));
    await user.type(screen.getByRole('combobox', { name: 'Payer' }), 'Acme');
    await user.click(screen.getByRole('option', { name: 'Acme' }));
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() => {
      expect(createReceipt).toHaveBeenCalledWith(
        expect.objectContaining({ postedAt: null })
      );
    });
    expect(toast.success).toHaveBeenCalledWith('Draft saved successfully');
    expect(onSuccess).toHaveBeenCalledOnce();
  });
  it('retains the continuation and entered values after a failed transaction submission', async () => {
    const user = userEvent.setup();
    createReceipt.mockRejectedValueOnce(new Error('Request failed'));

    render(
      <InflowFormContainer
        onSuccess={onSuccess}
        initialValues={{
          accountId: 'bank-account',
          categoryId: 'sales-revenue',
          amount: { amount: 250, currencyCode: 'NGN', isMinorUnit: false },
          counterparty: { id: 'party-1', name: 'Acme' },
          description: 'Keep this transaction',
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(handleApiError).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
    expect(screen.getByLabelText('Description')).toHaveValue(
      'Keep this transaction'
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });
  it('saves edits to the receipt draft', async () => {
    const user = userEvent.setup();
    const draft = { ...journalEntry, status: 'draft' as const, postedAt: null };
    render(<InflowFormContainer journalEntry={draft} onSuccess={onSuccess} />);

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
        sourceLines: [expect.objectContaining({ id: 'source-line' })],
        destinationLine: expect.objectContaining({ id: 'destination-line' }),
      })
    );
    expect(updateDraft.mock.calls[0][1]).not.toHaveProperty('postedAt');
    expect(updateDraft.mock.calls[0][1]).not.toHaveProperty('attachments');
    expect(updateDraft).toHaveBeenCalledOnce();
  });

  it('uses metadata update when only the receipt description changes', async () => {
    const user = userEvent.setup();
    render(
      <InflowFormContainer journalEntry={journalEntry} onSuccess={onSuccess} />
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

  it('voids and replaces a posted receipt when the amount changes', async () => {
    const user = userEvent.setup();

    const receipt = {
      url: 'https://example.com/receipt.pdf',
      name: 'receipt.pdf',
      type: 'application/pdf',
      size: 10,
    };

    render(
      <InflowFormContainer
        journalEntry={{ ...journalEntry, attachments: [receipt] }}
        onSuccess={onSuccess}
      />
    );

    const amount = screen.getByLabelText('Amount');
    await user.clear(amount);
    await user.type(amount, '300');
    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() =>
      expect(voidAndReplace).toHaveBeenCalledWith(
        journalEntry.id,
        expect.objectContaining({
          postedAt: timestamp,
          destinationLine: expect.objectContaining({
            amount: expect.objectContaining({ amount: 300 }),
          }),
        })
      )
    );
    expect(voidAndReplace.mock.calls[0][1].attachmentReferences).toEqual([
      receipt.url,
    ]);
    expect(updateMeta).not.toHaveBeenCalled();
  });
});
