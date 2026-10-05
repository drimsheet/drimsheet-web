import { DocumentUpload } from '@/shared/components/document-upload';
import {
  EFileType,
  type UFileType,
} from '@/shared/components/document-upload/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const defaultProps = {
  title: 'Upload receipt or bank statement',
  description: 'Attach a file for this transaction.',
  actionText: 'Upload',
  accept: [EFileType.Image, EFileType.Pdf],
  onUpload: vi.fn(),
};

const imageFile = new File(['receipt'], 'receipt.png', {
  type: EFileType.Png,
  lastModified: new Date('2026-06-02').getTime(),
});

const pdfFile = new File(['statement'], 'statement.pdf', {
  type: EFileType.Pdf,
  lastModified: new Date('2026-06-02').getTime(),
});

const invalidFile = new File(['text'], 'document.txt', {
  type: 'text/plain',
  lastModified: new Date('2026-06-02').getTime(),
});

const excelFile = new File(['spreadsheet'], 'statement.xlsx', {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  lastModified: new Date('2026-06-02').getTime(),
});

describe('DocumentUpload', () => {
  it('renders translated accepted file type labels below the empty state action', () => {
    render(<DocumentUpload {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
    expect(screen.getByText('Images & PDFs only')).toBeInTheDocument();
  });

  it('deduplicates translated accepted file type labels', () => {
    render(
      <DocumentUpload
        {...defaultProps}
        accept={[EFileType.Jpg, EFileType.Jpeg, EFileType.Png]}
      />
    );

    expect(screen.getByText('JPEGs & PNGs only')).toBeInTheDocument();
  });

  it('accepts Excel files by extension and labels them as one file type', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    render(
      <DocumentUpload
        {...defaultProps}
        accept={[EFileType.Xls, EFileType.Xlsx]}
        onUpload={onUpload}
      />
    );

    expect(screen.getByText('Excel files only')).toBeInTheDocument();

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(input, excelFile);

    expect(onUpload).toHaveBeenCalledWith([excelFile]);
  });

  it('handles custom / unknown file types in mapAcceptToLabel', () => {
    render(
      <DocumentUpload
        {...defaultProps}
        accept={['.doc' as unknown as UFileType, EFileType.Svg]}
      />
    );

    expect(screen.getByText('.doc & SVG only')).toBeInTheDocument();
  });

  it('renders translated accepted file type labels below the multiple add action', () => {
    render(
      <DocumentUpload {...defaultProps} value={[imageFile]} allowMultiple />
    );

    expect(screen.getByRole('button', { name: /Upload/i })).toBeInTheDocument();
    expect(screen.getByText('Images & PDFs only')).toBeInTheDocument();
    expect(screen.getByText('receipt.png')).toBeInTheDocument();
  });

  it('does not render accepted file type labels when a single file is uploaded', () => {
    render(<DocumentUpload {...defaultProps} value={[imageFile]} />);

    expect(screen.queryByText('Images & PDFs only')).not.toBeInTheDocument();
    expect(screen.getByText('receipt.png')).toBeInTheDocument();
  });

  it('handles file picker selection with input change', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    render(<DocumentUpload {...defaultProps} onUpload={onUpload} />);

    const button = screen.getByRole('button', { name: 'Upload' });
    expect(button).toBeInTheDocument();

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    expect(input).toBeInTheDocument();

    await user.upload(input, pdfFile);

    expect(onUpload).toHaveBeenCalledWith([pdfFile]);
  });

  it('ignores invalid file types during input change', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    render(<DocumentUpload {...defaultProps} onUpload={onUpload} />);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(input, invalidFile);

    expect(onUpload).not.toHaveBeenCalled();
  });

  it('accumulates files when allowMultiple is true', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    render(
      <DocumentUpload
        {...defaultProps}
        value={[imageFile]}
        allowMultiple
        onUpload={onUpload}
      />
    );

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(input, pdfFile);

    expect(onUpload).toHaveBeenCalledWith([imageFile, pdfFile]);
  });

  it('applies custom className and renders custom media', () => {
    render(
      <DocumentUpload
        {...defaultProps}
        className="custom-class"
        media={<span data-testid="custom-media">Custom Icon</span>}
      />
    );

    expect(screen.getByTestId('custom-media')).toBeInTheDocument();

    const wrapper = screen
      .getByText('Upload receipt or bank statement')
      .closest('.custom-class');

    expect(wrapper).toBeInTheDocument();
  });

  it('creates and revokes object URLs for image preview', () => {
    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:test-preview');

    const revokeObjectURLSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});

    const { unmount } = render(
      <DocumentUpload {...defaultProps} value={[imageFile]} />
    );

    expect(createObjectURLSpy).toHaveBeenCalledWith(imageFile);
    const img = document.querySelector('img')!;
    expect(img).toHaveAttribute('src', 'blob:test-preview');

    unmount();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-preview');

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('renders fallback icon for non-image previews like PDF', () => {
    render(<DocumentUpload {...defaultProps} value={[pdfFile]} />);

    expect(screen.getByText('statement.pdf')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('handles extension rules, wildcards, and empty rule branch in isAcceptedFile', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    const fileWithNoType = new File(['data'], 'test.pdf', { type: '' });

    render(
      <DocumentUpload
        {...defaultProps}
        accept={[
          '.pdf' as unknown as UFileType,
          'image/*' as unknown as UFileType,
          ' ' as unknown as UFileType,
        ]}
        onUpload={onUpload}
      />
    );

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(input, fileWithNoType);

    expect(onUpload).toHaveBeenCalledWith([fileWithNoType]);
  });

  it('accepts any file when accept prop is empty array', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();

    render(
      <DocumentUpload {...defaultProps} accept={[]} onUpload={onUpload} />
    );

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(input, invalidFile);

    expect(onUpload).toHaveBeenCalledWith([invalidFile]);
  });
});
