import { CounterpartyDeleteConfirmation } from '@/counterparty/dialogs/counterparty-deletion/parts/counterparty-delete-confirmation';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('CounterpartyDeleteConfirmation', () => {
  it('requires the exact confirmation keyword before deleting', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <CounterpartyDeleteConfirmation
        counterpartyName="Adenike Supplies"
        onDelete={onDelete}
        onOpenChange={vi.fn()}
        open
      />
    );

    const dialog = screen.getByRole('alertdialog', {
      name: 'Delete counterparty?',
    });

    const confirmationInput = within(dialog).getByLabelText(
      'Type "delete" to confirm'
    );

    const deleteButton = within(dialog).getByRole('button', {
      name: 'Delete',
    });

    expect(deleteButton).toBeDisabled();
    await user.type(confirmationInput, 'Delete');
    expect(deleteButton).toBeDisabled();
    await user.clear(confirmationInput);
    await user.type(confirmationInput, 'delete');
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledOnce();
  });
});
