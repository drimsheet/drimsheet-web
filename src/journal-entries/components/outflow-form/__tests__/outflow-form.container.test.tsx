import { usePermittedPostingAccounts } from '@/account/hooks/use-permitted-posting-accounts';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { useCounterparties } from '@/counterparty/hooks/use-counterparties';
import { OutflowFormContainer } from '@/journal-entries/components/outflow-form';
import { useCreatePayment } from '@/journal-entries/hooks/use-create-payment';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useExchangeRates } from '@/shared/hooks/use-exchange-rates';
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
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { navigate, rectifyJournalEntry } = vi.hoisted(() => ({
  navigate: vi.fn(),
  rectifyJournalEntry: vi.fn(),
}));

vi.mock('@/account/hooks/use-permitted-posting-accounts');
vi.mock('@/accounting/hooks/use-accounting-entity');
vi.mock('@/counterparty/hooks/use-counterparties');
vi.mock('@/journal-entries/hooks/use-create-payment');
vi.mock('@/journal-entries/hooks/use-rectify-journal-entry', () => ({
  useRectifyJournalEntry: () => ({
    mutateAsync: rectifyJournalEntry,
    isPending: false,
  }),
}));
vi.mock('@/shared/hooks/use-api-error-handler');
vi.mock('@/shared/hooks/use-exchange-rates');
vi.mock('@/shared/lib/services/file-upload.service', () => ({
  fileUploadService: {
    uploadAttachment: vi.fn(),
    uploadFile: vi.fn(),
  },
}));
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));

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
  version: 2,
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
      version: 1,
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
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ],
} satisfies IJournalEntryListDto;

const createPayment = vi.fn();
const handleApiError = vi.fn();

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

    vi.mocked(usePermittedPostingAccounts).mockImplementation((query) => {
      const data = query.side === 'source' ? accounts : categories;

      return { data: { data }, isPending: false } as never;
    });
    vi.mocked(useAccountingEntity).mockReturnValue({
      data: { functionalCurrencyCode: 'NGN' },
      isPending: false,
    } as never);
    vi.mocked(useCounterparties).mockReturnValue({
      data: { data: [] },
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
    rectifyJournalEntry.mockResolvedValue(undefined);
  });

  it('renders the outflow loading state while prerequisite data is pending', () => {
    vi.mocked(useAccountingEntity).mockReturnValue({
      data: undefined,
      isPending: true,
    } as never);

    render(<OutflowFormContainer />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading transaction form'
    );
  });

  it('maps neutral form values to a payment request after uploading an attachment', async () => {
    const user = userEvent.setup();

    const attachment = new File(['payment'], 'payment.pdf', {
      type: 'application/pdf',
    });

    render(<OutflowFormContainer />);

    await user.click(screen.getByRole('combobox', { name: 'Account' }));
    await user.click(screen.getByRole('option', { name: 'Operating account' }));
    await user.type(screen.getByLabelText('Amount'), '250');
    await user.click(screen.getByRole('combobox', { name: 'Category' }));
    await user.click(screen.getByRole('option', { name: 'Office expense' }));
    await user.type(
      screen.getByRole('combobox', { name: 'Recipient' }),
      'Acme'
    );
    await user.keyboard('{Escape}');
    await user.upload(screen.getByLabelText('Attach file'), attachment);
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(attachment);
      expect(createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          attachmentReferences: ['attachment-ref'],
          sourceLine: expect.objectContaining({
            accountId: 'bank-account',
            counterparty: { name: 'Acme' },
            sequenceOrder: 1,
          }),
          destinationLines: [
            expect.objectContaining({
              accountId: 'office-expense',
              counterparty: { name: 'Acme' },
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
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/transactions');
    });
    expect(handleApiError).not.toHaveBeenCalled();
  });

  it('creates a draft payment without a posting timestamp', async () => {
    const user = userEvent.setup();
    render(<OutflowFormContainer />);

    await user.click(screen.getByRole('combobox', { name: 'Account' }));
    await user.click(screen.getByRole('option', { name: 'Operating account' }));
    await user.type(screen.getByLabelText('Amount'), '250');
    await user.click(screen.getByRole('combobox', { name: 'Category' }));
    await user.click(screen.getByRole('option', { name: 'Office expense' }));
    await user.type(
      screen.getByRole('combobox', { name: 'Recipient' }),
      'Acme'
    );
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() => {
      expect(createPayment).toHaveBeenCalledWith(
        expect.objectContaining({ postedAt: null })
      );
    });
    expect(toast.success).toHaveBeenCalledWith('Draft saved successfully');
    expect(navigate).toHaveBeenCalledWith('/transactions');
  });

  it('prefills and rectifies an existing payment', async () => {
    const user = userEvent.setup();
    render(<OutflowFormContainer journalEntry={journalEntry} />);

    expect(screen.getByLabelText('Description')).toHaveValue('Office supplies');
    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(rectifyJournalEntry).toHaveBeenCalledWith({
        id: 'payment-entry',
        payload: expect.objectContaining({
          expectedVersion: 2,
          sourceType: 'payment',
          sourceLine: expect.objectContaining({ id: 'cash-line' }),
          destinationLines: [expect.objectContaining({ id: 'category-line' })],
        }),
      });
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Transaction updated successfully'
    );
    expect(createPayment).not.toHaveBeenCalled();
  });
});
