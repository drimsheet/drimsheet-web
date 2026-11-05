import { usePermittedPostingAccounts } from '@/account/hooks/use-permitted-posting-accounts';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { useCounterparties } from '@/counterparty/hooks/use-counterparties';
import { InflowFormContainer } from '@/journal-entries/components/inflow-form';
import { useCreateReceipt } from '@/journal-entries/hooks/use-create-receipt';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useExchangeRates } from '@/shared/hooks/use-exchange-rates';
import type {
  IJournalEntryListDto,
  ILedgerAccountDto,
} from '@/shared/lib/api/Api';
import { fileUploadService } from '@/shared/lib/services/file-upload.service';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('@/account/hooks/use-permitted-posting-accounts');
vi.mock('@/accounting/hooks/use-accounting-entity');
vi.mock('@/counterparty/hooks/use-counterparties');
vi.mock('@/journal-entries/hooks/use-create-receipt');
vi.mock('@/journal-entries/hooks/use-rectify-journal-entry', () => ({
  useRectifyJournalEntry: () => ({ mutateAsync: vi.fn(), isPending: false }),
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
    id: 'sales-revenue',
    code: '4000',
    name: 'Sales revenue',
    type: 'revenue',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
] as unknown as ILedgerAccountDto[];

const createReceipt = vi.fn();
const handleApiError = vi.fn();

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
        journalEntry={
          {
            sourceType: 'receipt',
            effectiveDate: '2026-09-21',
            memo: '',
            lines: [
              {
                sequenceOrder: 1,
                account: { id: 'sales-revenue' },
                amount: {
                  amount: 250,
                  currencyCode: 'NGN',
                  isMinorUnit: false,
                },
              },
              {
                sequenceOrder: 2,
                account: { id: 'bank-account' },
                amount: {
                  amount: 250,
                  currencyCode: 'NGN',
                  isMinorUnit: false,
                },
              },
            ],
          } as IJournalEntryListDto
        }
        onAddCounterparty={vi.fn()}
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

    render(<InflowFormContainer />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading transaction form'
    );
  });

  it('maps neutral form values to a receipt request after uploading an attachment', async () => {
    const user = userEvent.setup();

    const attachment = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    const onSuccess = vi.fn().mockResolvedValue(undefined);
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
    await user.upload(screen.getByLabelText('Attach file'), attachment);
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(attachment);
      expect(createReceipt).toHaveBeenCalledWith(
        expect.objectContaining({
          attachmentReferences: ['attachment-ref'],
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
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
      expect(navigate).toHaveBeenCalledWith('/transactions');
    });
    expect(handleApiError).not.toHaveBeenCalled();
  });

  it('creates a draft receipt without a posting timestamp', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn().mockResolvedValue(undefined);
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
    expect(navigate).toHaveBeenCalledWith('/transactions');
  });
  it('retains the continuation and entered values after a failed transaction submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
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
    expect(navigate).not.toHaveBeenCalled();
  });
});
