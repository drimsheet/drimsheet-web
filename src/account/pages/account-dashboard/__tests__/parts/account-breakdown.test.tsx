import { AccountBreakdown } from '@/account/pages/account-dashboard/parts/account-breakdown';
import type { AccountBreakdownProps } from '@/account/pages/account-dashboard/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const props: AccountBreakdownProps = {
  type: 'asset',
  accounts: [],
  loading: false,
  error: false,
  hasMore: false,
  loadingMore: false,
  onLoadMore: () => {},
  onRetry: () => {},
  onViewAccount: () => {},
};

describe('AccountBreakdown', () => {
  it('preserves negative balances and unavailable shares and opens the selected account', async () => {
    const onViewAccount = vi.fn();
    render(
      <AccountBreakdown
        {...props}
        onViewAccount={onViewAccount}
        accounts={[
          {
            accountId: 'contra',
            accountName: 'Contra balance',
            code: '1000',
            type: 'asset',
            subType: 'cash_and_cash_equivalent',
            status: 'active',
            amount: { amount: -123450, currencyCode: 'NGN', isMinorUnit: true },
            sharePercentage: null,
          },
        ]}
      />
    );
    const button = screen.getByRole('button', { name: /Contra balance/ });
    expect(button).toHaveTextContent('-₦1,234.5');
    expect(button).toHaveTextContent('—');
    expect(button).not.toHaveTextContent('0%');
    await userEvent.click(button);
    expect(onViewAccount).toHaveBeenCalledWith('contra');
  });
  it('retries a failed additional page while preserving previously loaded accounts', async () => {
    const onRetry = vi.fn();
    render(
      <AccountBreakdown
        {...props}
        error
        onRetry={onRetry}
        accounts={[
          {
            accountId: 'existing',
            accountName: 'Existing balance',
            code: '1000',
            type: 'asset',
            subType: 'cash_and_cash_equivalent',
            status: 'active',
            amount: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
            sharePercentage: null,
          },
        ]}
      />
    );
    expect(
      screen.getByRole('button', { name: /Existing balance/ })
    ).toBeVisible();
    expect(screen.queryByText('No assets yet')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
