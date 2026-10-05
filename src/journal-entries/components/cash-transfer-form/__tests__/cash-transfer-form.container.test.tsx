import { usePermittedPostingAccounts } from '@/account/hooks/use-permitted-posting-accounts';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { CashTransferFormContainer } from '@/journal-entries/components/cash-transfer-form';
import { useCreateTransfer } from '@/journal-entries/hooks/use-create-transfer';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useExchangeRates } from '@/shared/hooks/use-exchange-rates';
import type { ILedgerAccountDto } from '@/shared/lib/api/Api';
import { fileUploadService } from '@/shared/lib/services/file-upload.service';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('@/account/hooks/use-permitted-posting-accounts');
vi.mock('@/accounting/hooks/use-accounting-entity');
vi.mock('@/journal-entries/hooks/use-create-transfer');
vi.mock('@/journal-entries/hooks/use-rectify-journal-entry', () => ({
  useRectifyJournalEntry: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/shared/hooks/use-api-error-handler');
vi.mock('@/shared/hooks/use-exchange-rates');
vi.mock('@/shared/lib/services/file-upload.service', () => ({
  fileUploadService: { uploadAttachment: vi.fn(), uploadFile: vi.fn() },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));

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

    render(<CashTransferFormContainer />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading transfer form'
    );
  });

  it('uploads the receipt and creates a mapped transfer', async () => {
    const user = userEvent.setup();

    const attachment = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    render(<CashTransferFormContainer />);

    await user.click(screen.getByRole('combobox', { name: 'Source account' }));
    await user.click(screen.getByRole('option', { name: 'Operating account' }));
    await user.click(
      screen.getByRole('combobox', { name: 'Destination account' })
    );
    await user.click(screen.getByRole('option', { name: 'Petty cash' }));
    await user.type(screen.getByLabelText('Amount sent'), '250');
    await user.upload(screen.getByLabelText('Attach receipt'), attachment);
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(attachment);
      expect(createTransfer).toHaveBeenCalledWith(
        expect.objectContaining({
          attachmentReferences: ['attachment-ref'],
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
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/transactions');
    });
    expect(handleApiError).not.toHaveBeenCalled();
  });

  it('creates a draft transfer without a posting timestamp', async () => {
    const user = userEvent.setup();
    render(<CashTransferFormContainer />);

    await user.click(screen.getByRole('combobox', { name: 'Source account' }));
    await user.click(screen.getByRole('option', { name: 'Operating account' }));
    await user.click(
      screen.getByRole('combobox', { name: 'Destination account' })
    );
    await user.click(screen.getByRole('option', { name: 'Petty cash' }));
    await user.type(screen.getByLabelText('Amount sent'), '250');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() => {
      expect(createTransfer).toHaveBeenCalledWith(
        expect.objectContaining({ postedAt: null })
      );
    });
    expect(toast.success).toHaveBeenCalledWith('Draft saved successfully');
    expect(navigate).toHaveBeenCalledWith('/transactions');
  });
});
