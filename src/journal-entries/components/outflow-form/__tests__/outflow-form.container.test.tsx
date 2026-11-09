import { usePermittedPostingAccounts } from '@/account/hooks/use-permitted-posting-accounts';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { useCounterparties } from '@/counterparty/hooks/use-counterparties';
import { OutflowFormContainer } from '@/journal-entries/components/outflow-form';
import { useCreatePayment } from '@/journal-entries/hooks/use-create-payment';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useExchangeRates } from '@/shared/hooks/use-exchange-rates';
import { drimsheetApi } from '@/shared/lib/api';
import {
  ECounterpartyStatus,
  EJournalEntrySourceType,
  EJournalEntryStatus,
  EJournalSide,
  type IJournalEntryListDto,
  type ILedgerAccountDto,
  type TEntityId,
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
vi.mock('@/journal-entries/hooks/use-create-payment');
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
    info: vi.fn(),
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
    id: 'office-expense',
    code: '6000',
    name: 'Office expense',
    type: 'expense',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
] as unknown as ILedgerAccountDto[];

const timestamp = '2026-09-21T10:00:00.000Z';

const transactionMoney = {
  amount: 250,
  currencyCode: 'NGN',
  isMinorUnit: false,
};

const journalEntry = {
  id: 'payment-entry',
  accountingEntityId: 'entity-1',
  sourceType: EJournalEntrySourceType.Payment,
  memo: 'Office supplies',
  status: EJournalEntryStatus.Posted,
  effectiveDate: '2026-09-21T00:00:00.000Z',
  postedAt: timestamp,
  voidedAt: null,
  voidingEntryId: null,
  createdBy: '00000000-0000-4000-8000-000000000100' as TEntityId,
  createdAt: timestamp,
  updatedAt: timestamp,
  attachments: [],
  lines: [
    {
      id: 'cash-line',
      entryId: 'payment-entry',
      account: { id: 'bank-account', name: 'Operating account' },
      counterparty: {
        id: 'vendor-1',
        name: 'Acme',
        status: ECounterpartyStatus.Active,
      },
      sequenceOrder: 1,
      amount: transactionMoney,
      exchangeRate: null,
      functionalAmount: transactionMoney,
      side: EJournalSide.Credit,
      description: 'Office supplies',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'category-line',
      entryId: 'payment-entry',
      account: { id: 'office-expense', name: 'Office expense' },
      counterparty: {
        id: 'vendor-1',
        name: 'Acme',
        status: ECounterpartyStatus.Active,
      },
      sequenceOrder: 2,
      amount: transactionMoney,
      exchangeRate: null,
      functionalAmount: transactionMoney,
      side: EJournalSide.Debit,
      description: 'Office supplies',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ],
} satisfies IJournalEntryListDto;

const createPayment = vi.fn();
const handleApiError = vi.fn();

const updateDraft = vi.spyOn(drimsheetApi.journalEntries, 'updateDraftPayment');

const voidAndReplace = vi.spyOn(
  drimsheetApi.journalEntries,
  'voidAndReplacePayment'
);

const updateMeta = vi.spyOn(
  drimsheetApi.journalEntries,
  'updateJournalEntryMeta'
);

function render(element: ReactElement) {
  const queryClient = new QueryClient();

  const result = renderComponent(element, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  return { ...result, queryClient };
}

describe('OutflowFormContainer', () => {
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
      const data = query.side === 'source' ? accounts : categories;

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
    vi.mocked(useCreatePayment).mockReturnValue({
      mutateAsync: createPayment,
      isPending: false,
    } as never);
    vi.mocked(useApiErrorHandler).mockReturnValue(handleApiError);
    vi.mocked(fileUploadService.uploadFile).mockResolvedValue('attachment-ref');
    createPayment.mockResolvedValue(undefined);
  });

  it('omits counterparty creation when editing an existing transaction', async () => {
    const user = userEvent.setup();
    render(
      <OutflowFormContainer
        journalEntry={journalEntry}
        onAddCounterparty={vi.fn()}
        onSuccess={onSuccess}
      />
    );
    const counterparty = screen.getByRole('combobox', { name: 'Recipient' });
    await user.clear(counterparty);
    await user.type(counterparty, 'New person');
    expect(
      screen.queryByRole('option', { name: 'Add new counterparty' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/will be created as an individual/)
    ).not.toBeInTheDocument();
  });

  it('renders the outflow loading state while prerequisite data is pending', () => {
    vi.mocked(useAccountingEntity).mockReturnValue({
      data: undefined,
      isPending: true,
    } as never);

    render(<OutflowFormContainer onSuccess={onSuccess} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading transaction form'
    );
  });

  it('maps neutral form values to a payment request after uploading an attachment', async () => {
    const user = userEvent.setup();

    const attachment = new File(['payment'], 'payment.pdf', {
      type: 'application/pdf',
    });

    render(<OutflowFormContainer onSuccess={onSuccess} />);

    await user.click(screen.getByRole('combobox', { name: 'Account' }));
    await user.click(
      screen.getByRole('option', { name: /^Operating account/ })
    );
    await user.type(screen.getByLabelText('Amount'), '250');
    await user.click(screen.getByRole('combobox', { name: 'Category' }));
    await user.click(screen.getByRole('option', { name: 'Office expense' }));
    await user.type(
      screen.getByRole('combobox', { name: 'Recipient' }),
      'Acme'
    );
    await user.click(screen.getByRole('option', { name: 'Acme' }));
    await user.upload(screen.getByLabelText('Attach file'), attachment);
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(attachment);
      expect(createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          attachmentReferences: ['attachment-ref'],
          sourceLine: expect.objectContaining({
            accountId: 'bank-account',
            counterpartyId: 'party-1',
            sequenceOrder: 1,
          }),
          destinationLines: [
            expect.objectContaining({
              accountId: 'office-expense',
              counterpartyId: 'party-1',
              sequenceOrder: 2,
            }),
          ],
        })
      );
    });
    expect(usePermittedPostingAccounts).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceType: 'payment',
        side: 'source',
      })
    );
    expect(usePermittedPostingAccounts).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceType: 'payment',
        side: 'destination',
      })
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Transaction was created successfully.'
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(handleApiError).not.toHaveBeenCalled();
  });

  it('creates a draft payment without a posting timestamp', async () => {
    const user = userEvent.setup();
    render(<OutflowFormContainer onSuccess={onSuccess} />);

    await user.click(screen.getByRole('combobox', { name: 'Account' }));
    await user.click(
      screen.getByRole('option', { name: /^Operating account/ })
    );
    await user.type(screen.getByLabelText('Amount'), '250');
    await user.click(screen.getByRole('combobox', { name: 'Category' }));
    await user.click(screen.getByRole('option', { name: 'Office expense' }));
    await user.type(
      screen.getByRole('combobox', { name: 'Recipient' }),
      'Acme'
    );
    await user.click(screen.getByRole('option', { name: 'Acme' }));
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() => {
      expect(createPayment).toHaveBeenCalledWith(
        expect.objectContaining({ postedAt: null })
      );
    });
    expect(toast.success).toHaveBeenCalledWith('Draft saved successfully');
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('saves edits to the payment draft', async () => {
    const user = userEvent.setup();
    const draft = { ...journalEntry, status: 'draft' as const, postedAt: null };

    const { queryClient } = render(
      <OutflowFormContainer journalEntry={draft} onSuccess={onSuccess} />
    );

    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

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
        sourceLine: expect.objectContaining({ id: 'cash-line' }),
        destinationLines: [expect.objectContaining({ id: 'category-line' })],
      })
    );
    expect(updateDraft.mock.calls[0][1]).not.toHaveProperty('postedAt');
    expect(updateDraft.mock.calls[0][1]).not.toHaveProperty('attachments');
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['journalEntryService', 'getJournalEntries'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['journalEntryService', 'getJournalEntry', journalEntry.id],
    });
    expect(updateDraft).toHaveBeenCalledOnce();
  });

  it('shows feedback without saving an equivalent draft edit', async () => {
    const user = userEvent.setup();
    render(
      <OutflowFormContainer
        journalEntry={{ ...journalEntry, status: 'draft', postedAt: null }}
        onSuccess={onSuccess}
      />
    );

    const description = screen.getByLabelText('Description');
    await user.type(description, ' ');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() =>
      expect(toast.info).toHaveBeenCalledWith('No changes to save')
    );
    expect(description).toHaveValue(`${journalEntry.memo} `);
    expect(updateDraft).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('uses metadata update when only the payment description changes', async () => {
    const user = userEvent.setup();

    const { queryClient } = render(
      <OutflowFormContainer journalEntry={journalEntry} onSuccess={onSuccess} />
    );

    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

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
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['journalEntryService', 'getJournalEntries'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['journalEntryService', 'getJournalEntry', journalEntry.id],
    });
  });

  it.each(['preserve', 'remove', 'replace'] as const)(
    'can %s attachments during a financial correction',
    async (action) => {
      const user = userEvent.setup();

      const { queryClient } = render(
        <OutflowFormContainer
          journalEntry={{
            ...journalEntry,
            attachments: [
              {
                url: 'https://example.com/receipt.pdf',
                name: 'receipt.pdf',
                type: 'application/pdf',
                size: 10,
              },
            ],
          }}
          onSuccess={onSuccess}
        />
      );

      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
      const amount = screen.getByLabelText('Amount');
      await user.clear(amount);
      await user.type(amount, '300');
      if (action !== 'preserve') {
        await user.click(
          screen.getByRole('button', { name: 'Remove file receipt.pdf' })
        );
      }

      if (action === 'replace') {
        await user.upload(
          screen.getByLabelText('Attach file'),
          new File(['receipt'], 'new-receipt.pdf', { type: 'application/pdf' })
        );
      }

      await user.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() =>
        expect(voidAndReplace).toHaveBeenCalledWith(
          journalEntry.id,
          expect.objectContaining({
            postedAt: timestamp,
            sourceLine: expect.objectContaining({
              amount: expect.objectContaining({ amount: 300 }),
            }),
          })
        )
      );
      const request = voidAndReplace.mock.calls[0][1];
      if (action === 'preserve') {
        expect(request.attachmentReferences).toEqual([
          'https://example.com/receipt.pdf',
        ]);
      } else {
        expect(request.attachmentReferences).toEqual(
          action === 'remove' ? [] : ['attachment-ref']
        );
      }

      expect(updateMeta).not.toHaveBeenCalled();
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['journalEntryService', 'getJournalEntries'],
      });
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['journalEntryService', 'getJournalEntry', journalEntry.id],
      });
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['journalEntryService', 'getJournalEntry', 'replacement'],
      });
    }
  );

  it('sends the kept file and new uploads together when correcting a payment', async () => {
    const user = userEvent.setup();

    const receipt = {
      url: 'https://example.com/receipt.pdf',
      name: 'receipt.pdf',
      type: 'application/pdf',
      size: 10,
    };

    const invoice = {
      ...receipt,
      url: 'https://example.com/invoice.pdf',
      name: 'invoice.pdf',
    };

    const uploads = ['new-receipt.pdf', 'statement.pdf'].map(
      (name) => new File(['receipt'], name, { type: 'application/pdf' })
    );

    vi.mocked(fileUploadService.uploadFile).mockImplementation(
      async (file) => `ref-${file.name}`
    );

    render(
      <OutflowFormContainer
        journalEntry={{ ...journalEntry, attachments: [receipt, invoice] }}
        onSuccess={onSuccess}
      />
    );

    const amount = screen.getByLabelText('Amount');
    await user.clear(amount);
    await user.type(amount, '300');
    await user.click(
      screen.getByRole('button', { name: 'Remove file receipt.pdf' })
    );
    await user.upload(screen.getByLabelText('Attach file'), uploads);
    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() =>
      expect(voidAndReplace).toHaveBeenCalledWith(
        journalEntry.id,
        expect.objectContaining({
          attachmentReferences: [
            invoice.url,
            'ref-new-receipt.pdf',
            'ref-statement.pdf',
          ],
        })
      )
    );
    expect(fileUploadService.uploadFile).toHaveBeenCalledTimes(2);
    expect(voidAndReplace).toHaveBeenCalledOnce();
    expect(updateMeta).not.toHaveBeenCalled();
  });

  it('skips mutations for an unchanged posted payment', async () => {
    const user = userEvent.setup();
    render(
      <OutflowFormContainer journalEntry={journalEntry} onSuccess={onSuccess} />
    );

    await user.click(screen.getByRole('button', { name: 'Update' }));
    await waitFor(() =>
      expect(toast.info).toHaveBeenCalledWith('No changes to save')
    );

    expect(onSuccess).not.toHaveBeenCalled();
    expect(updateMeta).not.toHaveBeenCalled();
    expect(voidAndReplace).not.toHaveBeenCalled();
    expect(updateDraft).not.toHaveBeenCalled();
  });

  it('adds a receipt and removes only the selected attachment when saving a draft', async () => {
    const user = userEvent.setup();

    const file = new File(['receipt'], 'new-receipt.pdf', {
      type: 'application/pdf',
    });

    const receipt = {
      url: 'https://example.com/receipt.pdf',
      name: 'receipt.pdf',
      type: 'application/pdf',
      size: 10,
    };

    const invoice = {
      ...receipt,
      url: 'https://example.com/invoice.pdf',
      name: 'invoice.pdf',
    };

    const draft = {
      ...journalEntry,
      status: 'draft' as const,
      postedAt: null,
      attachments: [receipt, invoice],
    };

    const { rerender } = render(
      <OutflowFormContainer journalEntry={draft} onSuccess={onSuccess} />
    );

    await user.click(
      screen.getByRole('button', { name: 'Remove file receipt.pdf' })
    );
    await user.upload(screen.getByLabelText('Attach file'), file);
    expect(screen.queryByText(receipt.name)).not.toBeInTheDocument();
    expect(screen.getByText(invoice.name)).toBeVisible();
    expect(
      screen.getByRole('button', { name: `Remove file ${file.name}` })
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() =>
      expect(updateDraft).toHaveBeenCalledWith(
        journalEntry.id,
        expect.objectContaining({
          attachments: { add: ['attachment-ref'], remove: [receipt.url] },
        })
      )
    );

    const savedReceipt = {
      url: 'https://example.com/new-receipt.pdf',
      name: file.name,
      type: file.type,
      size: file.size,
    };

    rerender(
      <OutflowFormContainer
        journalEntry={{ ...draft, attachments: [invoice, savedReceipt] }}
        onSuccess={onSuccess}
      />
    );
    expect(
      await screen.findByRole('link', { name: `Open attachment ${file.name}` })
    ).toHaveAttribute('href', savedReceipt.url);
  });

  it('adds a receipt to a posted payment using only the metadata endpoint', async () => {
    const user = userEvent.setup();

    const receipt = {
      url: 'https://example.com/receipt.pdf',
      name: 'receipt.pdf',
      type: 'application/pdf',
      size: 10,
    };

    const file = new File(['receipt'], 'new-receipt.pdf', {
      type: 'application/pdf',
    });

    render(
      <OutflowFormContainer
        journalEntry={{ ...journalEntry, attachments: [receipt] }}
        onSuccess={onSuccess}
      />
    );

    await user.upload(screen.getByLabelText('Attach file'), file);
    expect(screen.getByText(receipt.name)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() =>
      expect(updateMeta).toHaveBeenCalledWith(journalEntry.id, {
        attachments: { add: ['attachment-ref'] },
      })
    );
    expect(updateDraft).not.toHaveBeenCalled();
    expect(voidAndReplace).not.toHaveBeenCalled();
  });
});
