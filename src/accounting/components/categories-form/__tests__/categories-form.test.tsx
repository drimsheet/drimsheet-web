import { CategoriesForm } from '@/accounting/components/categories-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('CategoriesForm — income', () => {
  it('selects all recommended categories and emits changed selections', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <>
        <CategoriesForm kind="income" id="income" onSubmit={onSubmit} />
        <button form="income" type="submit">
          Save
        </button>
      </>
    );
    expect(screen.getByRole('status')).toHaveTextContent('4 selected');
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).toBeChecked();
    }

    await user.click(screen.getByRole('checkbox', { name: 'Gifts (Default)' }));
    expect(screen.getByRole('status')).toHaveTextContent('3 selected');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith({
      categories: expect.arrayContaining([
        expect.objectContaining({ name: 'Gifts (Default)', selected: false }),
        expect.objectContaining({ name: 'Services (Default)', selected: true }),
      ]),
    });
  });

  it('validates a custom category and adds it selected under its parent', async () => {
    const user = userEvent.setup();
    render(<CategoriesForm kind="income" />);
    await user.click(
      screen.getByRole('button', { name: 'Add income category' })
    );
    await user.click(screen.getByRole('button', { name: 'Add to setup' }));
    expect(await screen.findByText('Select a parent account.')).toBeVisible();
    expect(
      screen.getByRole('textbox', { name: /Category name/ })
    ).toHaveAccessibleDescription('Enter a category name.');
    await user.click(screen.getByRole('combobox', { name: /Parent account/ }));
    await user.click(await screen.findByRole('option', { name: 'Services' }));
    await user.type(
      screen.getByRole('textbox', { name: /Category name/ }),
      '  Consulting  '
    );
    await user.click(screen.getByRole('button', { name: 'Add to setup' }));
    expect(
      await screen.findByRole('checkbox', { name: 'Consulting' })
    ).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('5 selected');
    expect(
      screen.getByRole('button', { name: 'Add income category' })
    ).toHaveFocus();
  });

  it('cancels without losing selections or adding the draft', async () => {
    const user = userEvent.setup();
    render(<CategoriesForm kind="income" />);
    await user.click(screen.getByRole('checkbox', { name: 'Gifts (Default)' }));
    await user.click(
      screen.getByRole('button', { name: 'Add income category' })
    );
    await user.type(
      screen.getByRole('textbox', { name: /Category name/ }),
      'Discard me'
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    expect(
      screen.getByRole('button', { name: 'Add income category' })
    ).toHaveFocus();
    expect(
      screen.getByRole('checkbox', { name: 'Gifts (Default)' })
    ).not.toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('3 selected');
  });

  it('allows no categories to be selected and respects disabled state', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CategoriesForm kind="income" />);
    for (const checkbox of screen.getAllByRole('checkbox')) {
      await user.click(checkbox);
    }

    expect(screen.getByRole('status')).toHaveTextContent('0 selected');
    rerender(<CategoriesForm kind="income" disabled />);
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).toBeDisabled();
    }

    expect(
      screen.getByRole('button', { name: 'Add income category' })
    ).toBeDisabled();
  });
});

describe('CategoriesForm — expense', () => {
  it('starts with four expense defaults and emits changed selections', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <>
        <CategoriesForm kind="expense" id="expenses" onSubmit={onSubmit} />
        <button type="submit" form="expenses">
          Save
        </button>
      </>
    );
    for (const name of [
      'Direct costs',
      'Rent and utilities',
      'Bank charges',
      'Interest',
    ]) {
      expect(
        screen.getByRole('checkbox', { name: `${name} (Default)` })
      ).toBeChecked();
    }

    expect(screen.getByRole('status')).toHaveTextContent('4 selected');
    await user.click(
      screen.getByRole('checkbox', { name: 'Interest (Default)' })
    );
    expect(screen.getByRole('status')).toHaveTextContent('3 selected');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith({
      categories: expect.arrayContaining([
        expect.objectContaining({ parentId: 'interest', selected: false }),
        expect.objectContaining({ parentId: 'direct_costs', selected: true }),
      ]),
    });
  });

  it('adds a validated expense category under an expense parent', async () => {
    const user = userEvent.setup();
    render(<CategoriesForm kind="expense" />);
    await user.click(
      screen.getByRole('button', { name: 'Add expense category' })
    );
    expect(
      screen.getByText('Add an expense category under a parent group.')
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Add to setup' }));
    expect(await screen.findByText('Select a parent account.')).toBeVisible();
    expect(
      screen.getByRole('textbox', { name: /Category name/ })
    ).toHaveAccessibleDescription('Enter a category name.');
    await user.click(screen.getByRole('combobox', { name: /Parent account/ }));
    expect(
      screen.queryByRole('option', { name: 'Services' })
    ).not.toBeInTheDocument();
    await user.click(
      await screen.findByRole('option', { name: 'Direct costs' })
    );
    await user.type(
      screen.getByRole('textbox', { name: /Category name/ }),
      '  Materials  '
    );
    await user.click(screen.getByRole('button', { name: 'Add to setup' }));
    expect(
      await screen.findByRole('checkbox', { name: 'Materials' })
    ).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('5 selected');
    expect(
      screen.getByRole('button', { name: 'Add expense category' })
    ).toHaveFocus();
  });
});
