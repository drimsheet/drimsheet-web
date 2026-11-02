import { EntryOverview } from '@/journal-entries/components/entry-overview';
import { MoneyJurisdictionProvider } from '@/shared/components/money';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('EntryOverview', () => {
  it('renders minor-unit amounts using the active money jurisdiction', () => {
    render(
      <MoneyJurisdictionProvider value="DE">
        <EntryOverview
          title="Consulting payment"
          amount={{ amount: 100050, currencyCode: 'EUR', isMinorUnit: true }}
          menuItems={[]}
        />
      </MoneyJurisdictionProvider>
    );

    expect(screen.getByText('1.000,50 €')).toBeInTheDocument();
  });

  it('invokes the caller-provided edit action', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <EntryOverview
        title="Consulting payment"
        amount={{ amount: 1000, currencyCode: 'NGN', isMinorUnit: false }}
        menuItems={[{ label: 'Edit', onSelect: onEdit }]}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Open entry actions' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledOnce();
  });
});
