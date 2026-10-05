import {
  ItemizedFields,
  type IItemizedFieldValue,
} from '@/journal-entries/components/itemized-fields';
import { TooltipProvider } from '@/shared/components/tooltip';
import type { ILedgerAccountDto } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const accounts = [
  {
    id: 'sales',
    code: '4000',
    name: 'Sales revenue',
    type: 'revenue',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
  {
    id: 'services',
    code: '4100',
    name: 'Professional services',
    type: 'revenue',
    balance: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
  },
] as unknown as ILedgerAccountDto[];

const item: IItemizedFieldValue = {
  id: 'first',
  amount: { amount: 1250, currencyCode: 'NGN', isMinorUnit: false },
  accountId: 'sales',
  description: '',
};

const secondItem: IItemizedFieldValue = {
  id: 'second',
  amount: { amount: 750, currencyCode: 'NGN', isMinorUnit: false },
  accountId: 'services',
  description: 'Second line',
};

function renderItemizedFields({
  defaultValue = [item],
  disabled = false,
  excludeSelectedAccounts = false,
  initialEditItemId,
  onChange = vi.fn(),
  onEditModeChange,
}: {
  defaultValue?: IItemizedFieldValue[];
  disabled?: boolean;
  excludeSelectedAccounts?: boolean;
  initialEditItemId?: string;
  onChange?: (items: IItemizedFieldValue[]) => void;
  onEditModeChange?: (isEditing: boolean) => void;
} = {}) {
  render(
    <TooltipProvider>
      <ItemizedFields
        accounts={accounts}
        currencyCode="NGN"
        defaultValue={defaultValue}
        disabled={disabled}
        excludeSelectedAccounts={excludeSelectedAccounts}
        initialEditItemId={initialEditItemId}
        onChange={onChange}
        onEditModeChange={onEditModeChange}
      />
    </TooltipProvider>
  );
}

describe('ItemizedFields', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();
    window.HTMLElement.prototype.setPointerCapture = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders committed items in view mode', () => {
    renderItemizedFields();

    expect(screen.getByText('Sales revenue')).toBeInTheDocument();
    expect(screen.getByText(/1,250/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Edit item 1' })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument();
  });

  it('renders a newly seeded item in edit mode when requested', () => {
    renderItemizedFields({ initialEditItemId: item.id });

    expect(screen.getByLabelText('Amount')).toHaveValue('1,250');
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit item 1' })
    ).not.toBeInTheDocument();
  });

  it('reports edit mode while an existing item is edited and saved', async () => {
    const user = userEvent.setup();
    const onEditModeChange = vi.fn();
    renderItemizedFields({ onEditModeChange });

    await user.click(screen.getByRole('button', { name: 'Edit item 1' }));

    expect(onEditModeChange).toHaveBeenLastCalledWith(true);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onEditModeChange.mock.calls).toEqual([[true], [false]]);
  });

  it('reports view mode when a new unsaved draft is deleted', async () => {
    const user = userEvent.setup();
    const onEditModeChange = vi.fn();
    renderItemizedFields({
      defaultValue: [],
      onEditModeChange,
    });

    await user.click(screen.getByRole('button', { name: 'Add a new item' }));
    await user.click(
      screen.getByRole('button', { name: 'Open item 1 actions' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(onEditModeChange.mock.calls).toEqual([[true], [false]]);
  });

  it('keeps reporting edit mode when another committed item is deleted', async () => {
    const user = userEvent.setup();
    const onEditModeChange = vi.fn();
    renderItemizedFields({
      defaultValue: [item, secondItem],
      onEditModeChange,
    });

    await user.click(screen.getByRole('button', { name: 'Edit item 1' }));
    await user.click(
      screen.getByRole('button', { name: 'Open item 2 actions' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(onEditModeChange).toHaveBeenCalledOnce();
    expect(onEditModeChange).toHaveBeenCalledWith(true);
  });

  it('commits an edited item only after Save is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderItemizedFields({ onChange });

    await user.click(screen.getByRole('button', { name: 'Edit item 1' }));
    await user.click(screen.getByRole('button', { name: 'Add a description' }));
    await user.type(screen.getByLabelText('Description'), 'Line note');
    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '100');

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([
      {
        ...item,
        amount: { amount: 100, currencyCode: 'NGN', isMinorUnit: false },
        description: 'Line note',
      },
    ]);
    expect(screen.getByText('Line note')).toBeInTheDocument();
    expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument();
  });

  it('validates only the active draft when Save is attempted', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderItemizedFields({ defaultValue: [], onChange });

    expect(screen.getByText('Add at least one item')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add a new item' }));

    expect(screen.getByLabelText('Category')).toHaveAttribute(
      'placeholder',
      'Select category'
    );
    expect(
      screen.queryByText('Item amount is required')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Item category is required')
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Item amount is required')).toBeInTheDocument();
    expect(screen.getByText('Item category is required')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('appends a valid new item on Save', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderItemizedFields({ onChange });

    await user.click(screen.getByRole('button', { name: 'Add a new item' }));
    await user.type(screen.getByLabelText('Amount'), '250');
    await user.click(screen.getByRole('combobox', { name: 'Category' }));
    await user.click(screen.getByRole('option', { name: 'Sales revenue' }));

    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toHaveLength(2);
    expect(onChange.mock.calls[0][0][0]).toEqual(item);
    expect(onChange.mock.calls[0][0][1]).toMatchObject({
      amount: { amount: 250, currencyCode: 'NGN', isMinorUnit: false },
      accountId: 'sales',
      description: '',
    });
  });

  it('excludes categories selected by committed items from a new row', async () => {
    const user = userEvent.setup();
    renderItemizedFields({ excludeSelectedAccounts: true });

    await user.click(screen.getByRole('button', { name: 'Add a new item' }));
    await user.click(screen.getByRole('combobox', { name: 'Category' }));

    expect(
      screen.queryByRole('option', { name: 'Sales revenue' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Professional services' })
    ).toBeInTheDocument();
  });

  it("retains the edited row's category and excludes other row selections", async () => {
    const user = userEvent.setup();
    renderItemizedFields({
      defaultValue: [item, secondItem],
      excludeSelectedAccounts: true,
    });

    await user.click(screen.getByRole('button', { name: 'Edit item 1' }));
    await user.click(screen.getByRole('combobox', { name: 'Category' }));

    expect(
      screen.getByRole('option', { name: 'Sales revenue' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Professional services' })
    ).not.toBeInTheDocument();
  });

  it('prevents another committed row from entering edit mode', async () => {
    const user = userEvent.setup();
    renderItemizedFields({ defaultValue: [item, secondItem] });

    await user.click(screen.getByRole('button', { name: 'Edit item 1' }));

    expect(screen.getByRole('button', { name: 'Edit item 2' })).toBeDisabled();
    await user.click(
      screen.getByRole('button', { name: 'Open item 2 actions' })
    );
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute(
      'data-disabled'
    );
  });

  it('opens edit mode from the view-row menu', async () => {
    const user = userEvent.setup();
    renderItemizedFields();

    const menuButton = screen.getByRole('button', {
      name: 'Open item 1 actions',
    });

    expect(
      menuButton.querySelector('.lucide-ellipsis-vertical')
    ).toBeInTheDocument();

    await user.click(menuButton);
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('deletes a committed item and emits the remaining state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderItemizedFields({ defaultValue: [item, secondItem], onChange });

    await user.click(
      screen.getByRole('button', { name: 'Open item 1 actions' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(onChange).toHaveBeenCalledWith([secondItem]);
  });

  it('discards a new unsaved draft without calling onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderItemizedFields({ defaultValue: [], onChange });

    await user.click(screen.getByRole('button', { name: 'Add a new item' }));
    await user.click(
      screen.getByRole('button', { name: 'Open item 1 actions' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Add a new item' })
    ).toBeInTheDocument();
  });

  it('truncates long descriptions and exposes the full text in a tooltip', async () => {
    const user = userEvent.setup();
    const description = 'A'.repeat(55);
    renderItemizedFields({ defaultValue: [{ ...item, description }] });

    const truncatedDescription = screen.getByText(`${'A'.repeat(45)}…`);
    await user.hover(truncatedDescription);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(description);
  });

  it('disables every available action', () => {
    renderItemizedFields({ disabled: true });

    expect(screen.getByRole('button', { name: 'Edit item 1' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Open item 1 actions' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Add a new item' })
    ).toBeDisabled();
  });
});
