import { IncomeCategoriesForm } from '@/accounting/components/income-categories-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('IncomeCategoriesForm', () => {
  it('selects all recommended categories and emits changed selections', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <>
        <IncomeCategoriesForm id="income" onSubmit={onSubmit} />
        <button form="income" type="submit">
          Save
        </button>
      </>
    );
    expect(screen.getByRole('status')).toHaveTextContent('4 selected');
    for (const checkbox of screen.getAllByRole('checkbox'))
      expect(checkbox).toBeChecked();
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
    render(<IncomeCategoriesForm />);
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
    render(<IncomeCategoriesForm />);
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
    const { rerender } = render(<IncomeCategoriesForm />);
    for (const checkbox of screen.getAllByRole('checkbox'))
      await user.click(checkbox);
    expect(screen.getByRole('status')).toHaveTextContent('0 selected');
    rerender(<IncomeCategoriesForm disabled />);
    for (const checkbox of screen.getAllByRole('checkbox'))
      expect(checkbox).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Add income category' })
    ).toBeDisabled();
  });
});
