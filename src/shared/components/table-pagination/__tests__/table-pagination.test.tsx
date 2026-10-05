import { TablePagination } from '@/shared/components/table-pagination';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('TablePagination', () => {
  const defaultMeta = {
    page: 2,
    limit: 10,
    total: 35,
    totalPages: 4,
  };

  it('renders all page links correctly', () => {
    render(<TablePagination meta={defaultMeta} onPageChange={() => {}} />);

    expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '3' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '4' })).toBeInTheDocument();
  });

  it('renders active page state correctly', () => {
    render(<TablePagination meta={defaultMeta} onPageChange={() => {}} />);

    const page2 = screen.getByRole('link', { name: '2' });
    expect(page2).toHaveAttribute('aria-current', 'page');
  });

  it('calls onPageChange when clicking a page link', () => {
    const handlePageChange = vi.fn();
    render(
      <TablePagination meta={defaultMeta} onPageChange={handlePageChange} />
    );

    const page3 = screen.getByRole('link', { name: '3' });
    fireEvent.click(page3);

    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('renders nothing if totalPages is 1 or less', () => {
    const { container } = render(
      <TablePagination
        meta={{ page: 1, limit: 10, total: 5, totalPages: 1 }}
        onPageChange={() => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
