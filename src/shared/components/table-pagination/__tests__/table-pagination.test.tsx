import { TablePagination } from '@/shared/components/table-pagination';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
describe('TablePagination', () => {
  it('shows a bounded result range and navigates previous/next pages', async () => {
    const user = userEvent.setup(),
      onPageChange = vi.fn();

    render(
      <TablePagination
        meta={{ page: 2, limit: 10, total: 35, totalPages: 4 }}
        onPageChange={onPageChange}
        unfilteredTotal={50}
      />
    );
    expect(
      screen.getByText('11–20 of 35 · filtered from 50')
    ).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 4')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });
  it('keeps an empty result informative and prevents navigation', () => {
    render(
      <TablePagination
        meta={{ page: 1, limit: 10, total: 0, totalPages: 0 }}
        onPageChange={() => {}}
      />
    );
    expect(screen.getByText('0–0 of 0')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Previous page' })
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });
  it('uses the exact final-page count and disables next', () => {
    render(
      <TablePagination
        meta={{ page: 4, limit: 10, total: 35, totalPages: 4 }}
        onPageChange={() => {}}
      />
    );
    expect(screen.getByText('31–35 of 35')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });
});
