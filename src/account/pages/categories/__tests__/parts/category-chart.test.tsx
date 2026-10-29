import { CategoryChart } from '@/account/pages/categories/parts/category-chart';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('CategoryChart', () => {
  it('shows signed amounts and unavailable shares, and emits the selected account', async () => {
    const user = userEvent.setup();
    const onViewAccount = vi.fn();
    const amount = { amount: -123450, currencyCode: 'NGN', isMinorUnit: true };
    render(
      <CategoryChart
        type="revenue"
        title="Revenue by category"
        description="Net revenue"
        section={{
          total: amount,
          previousTotal: amount,
          percentageChange: null,
          accounts: [
            {
              accountId: 'refunds',
              accountName: 'Refunds',
              amount,
              sharePercentage: null,
            },
          ],
        }}
        onViewAccount={onViewAccount}
      />
    );
    const button = screen.getByRole('button', { name: /Refunds/ });
    expect(button).toHaveTextContent('-NGN 1,234.5');
    expect(button).toHaveTextContent('—');
    await user.click(button);
    expect(onViewAccount).toHaveBeenCalledWith('refunds');
  });

  it('shows a zero-activity message rather than an empty graph', () => {
    const amount = { amount: 0, currencyCode: 'NGN', isMinorUnit: false };
    render(
      <CategoryChart
        type="revenue"
        title="Revenue by category"
        description="Net revenue"
        section={{
          total: amount,
          previousTotal: amount,
          percentageChange: null,
          accounts: [],
        }}
        onViewAccount={() => {}}
      />
    );
    expect(screen.getByText('No activity in this period')).toBeInTheDocument();
  });
});
