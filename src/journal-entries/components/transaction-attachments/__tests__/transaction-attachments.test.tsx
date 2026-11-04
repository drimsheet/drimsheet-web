import { TransactionAttachments } from '@/journal-entries/components/transaction-attachments';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

describe('TransactionAttachments', () => {
  it('retains selected attachments when more files are added', async () => {
    const user = userEvent.setup();
    const { container } = render(<TransactionAttachments />);

    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const receipt = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    const statement = new File(['statement'], 'statement.pdf', {
      type: 'application/pdf',
    });

    await user.upload(input, receipt);
    expect(screen.getByText('receipt.pdf')).toBeInTheDocument();

    await user.upload(input, statement);
    expect(screen.getByText('receipt.pdf')).toBeInTheDocument();
    expect(screen.getByText('statement.pdf')).toBeInTheDocument();
  });
});
