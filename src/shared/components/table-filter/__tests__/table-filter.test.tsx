import { TableFilter } from '@/shared/components/table-filter';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const options = [
  { label: 'Operating', value: 'operating' },
  { label: 'Savings', value: 'savings' },
];

describe('TableFilter', () => {
  it('discards unapplied changes on Escape and restores focus', async () => {
    const user = userEvent.setup(),
      onApply = vi.fn();

    render(
      <TableFilter
        title="Account"
        options={options}
        selectedValues={['operating']}
        onApply={onApply}
      />
    );

    const trigger = screen.getByRole('button', {
      name: 'Filter by Account, 1 active',
    });

    await user.click(trigger);
    await user.click(screen.getByRole('checkbox', { name: 'Savings' }));
    await user.keyboard('{Escape}');
    expect(onApply).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    expect(screen.getByRole('checkbox', { name: 'Operating' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Savings' })).not.toBeChecked();
  });
  it('applies multiple options atomically and closes the popover', async () => {
    const user = userEvent.setup(),
      onApply = vi.fn();

    render(
      <TableFilter
        title="Account"
        options={options}
        selectedValues={[]}
        onApply={onApply}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Filter by Account' }));
    await user.click(screen.getByRole('checkbox', { name: 'Operating' }));
    await user.click(screen.getByRole('checkbox', { name: 'Savings' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onApply).toHaveBeenCalledExactlyOnceWith(['operating', 'savings']);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
