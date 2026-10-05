import { FileUpload } from '@/shared/components/file-upload';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const defaultProps = {
  accept: ['image/jpeg', 'image/png', 'application/pdf'],
  actionText: 'Upload file',
  description: 'One file, up to 2 MB.',
  id: 'receipt-file',
  label: 'Attach receipt',
  onValueChange: vi.fn(),
  removeText: 'Remove file',
  replaceText: 'Replace file',
  value: null,
};

describe('FileUpload', () => {
  it('selects one file through its labelled native input', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FileUpload {...defaultProps} onValueChange={onValueChange} />);

    const file = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    await user.upload(screen.getByLabelText('Attach receipt'), file);

    expect(onValueChange).toHaveBeenCalledWith(file);
    expect(screen.getByLabelText('Attach receipt')).toHaveAttribute(
      'accept',
      'image/jpeg,image/png,application/pdf'
    );
  });

  it('shows and removes a selected file', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    const file = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    render(
      <FileUpload
        {...defaultProps}
        onValueChange={onValueChange}
        value={file}
      />
    );

    expect(screen.getByText('receipt.pdf')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Replace file' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Remove file' }));
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it('disables picker and remove actions', () => {
    const file = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    render(<FileUpload {...defaultProps} disabled value={file} />);

    expect(screen.getByLabelText('Attach receipt')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Replace file' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove file' })).toBeDisabled();
  });
});
