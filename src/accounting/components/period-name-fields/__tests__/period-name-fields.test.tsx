import type { PeriodNameFieldsProps } from '@/accounting/components/period-name-fields';
import { PeriodNameFields } from '@/accounting/components/period-name-fields';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

const props: PeriodNameFieldsProps = {
  title: 'Name your accounting periods',
  periods: [{ name: 'Q1', startDate: '2026-01-01', endDate: '2026-03-31' }],
  unit: 'quarter',
  currentDate: '2026-02-01',
  disabled: false,
  getError: () => [],
  onNameChange: () => {},
  onNameBlur: () => {},
};

describe('PeriodNameFields accessibility', () => {
  it('lets keyboard users focus the named scroll region and its inputs', async () => {
    const user = userEvent.setup();
    render(<PeriodNameFields {...props} />);

    await user.tab();
    expect(
      screen.getByRole('region', { name: 'Name your accounting periods' })
    ).toHaveFocus();

    await user.tab();
    const input = screen.getByRole('textbox', { name: 'Quarter 1' });
    expect(input).toHaveFocus();
    expect(input).toHaveAccessibleDescription(
      'Jan 1, 2026 – Mar 31, 2026 Current'
    );
  });

  it('links rendered errors without leaving missing error descriptions when cleared', () => {
    const { rerender } = render(
      <PeriodNameFields
        {...props}
        getError={() => [{ message: 'Enter a name for this period.' }]}
      />
    );

    const input = screen.getByRole('textbox', { name: 'Quarter 1' });

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'Jan 1, 2026 – Mar 31, 2026 Current Enter a name for this period.'
    );

    rerender(
      <PeriodNameFields
        {...props}
        currentDate="2026-04-01"
        getError={() => [{ message: undefined }]}
      />
    );
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAccessibleDescription('Jan 1, 2026 – Mar 31, 2026');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    for (const id of input.getAttribute('aria-describedby')!.split(' ')) {
      expect(document.getElementById(id)).not.toBeNull();
    }
  });
});
