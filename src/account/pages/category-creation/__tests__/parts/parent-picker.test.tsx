import { CategoryParentPicker } from '@/account/pages/category-creation/parts/parent-picker';
import type { TCategoryAccount } from '@/account/pages/category-creation/types';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const utilities: TCategoryAccount = {
  id: 'utilities' as TCategoryAccount['id'],
  name: 'Utilities',
  code: '5101',
  type: 'expense',
  behavior: 'rent_and_utilities',
  isControlAccount: false,
  status: 'active',
  children: [],
};

const operating: TCategoryAccount = {
  ...utilities,
  id: 'operating' as TCategoryAccount['id'],
  name: 'Operating expenses',
  isControlAccount: true,
  children: [utilities],
};

function setup() {
  const onSelect = vi.fn();
  render(
    <CategoryParentPicker
      type="expense"
      parent={null}
      accounts={[operating]}
      loading={false}
      error={false}
      disabled={false}
      onSelect={onSelect}
      onOpenChange={() => {}}
    />
  );

  return { onSelect, user: userEvent.setup() };
}

describe('CategoryParentPicker', () => {
  it('searches descendants with their ancestor context and confirms a selection', async () => {
    const { user, onSelect } = setup();
    await user.click(
      screen.getByRole('button', { name: 'Select parent account' })
    );
    const sheet = screen.getByRole('dialog');
    expect(
      within(sheet).queryByRole('radio', { name: 'Utilities' })
    ).not.toBeInTheDocument();
    await user.type(within(sheet).getByRole('searchbox'), 'uTiLi');
    expect(
      within(sheet).getByRole('radio', { name: 'Operating expenses' })
    ).toBeVisible();
    await user.click(within(sheet).getByRole('radio', { name: 'Utilities' }));
    expect(
      within(sheet).queryByText('Parent', { exact: true })
    ).not.toBeInTheDocument();
    expect(
      within(sheet).queryByText('Child', { exact: true })
    ).not.toBeInTheDocument();
    expect(
      within(sheet).queryByText('Operating expenses / Utilities')
    ).not.toBeInTheDocument();
    await user.click(
      within(sheet).getByRole('button', { name: 'Use selected parent' })
    );
    expect(onSelect).toHaveBeenCalledWith('utilities');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('shows an empty search and clears the search and draft selection on reopening', async () => {
    const { user, onSelect } = setup();
    await user.click(
      screen.getByRole('button', { name: 'Select parent account' })
    );
    await user.click(
      screen.getByRole('button', {
        name: 'Expand or collapse Operating expenses',
      })
    );
    await user.click(screen.getByRole('radio', { name: 'Utilities' }));
    await user.type(screen.getByRole('searchbox'), 'no such account');
    expect(screen.getByText('No matching accounts')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onSelect).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole('button', { name: 'Select parent account' })
    );
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(
      screen.queryByRole('radio', { name: 'Utilities' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Use selected parent' })
    ).toBeDisabled();
  });
});
