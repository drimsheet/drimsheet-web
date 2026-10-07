import { CounterpartyRowActions } from '@/counterparty/components/counterparties-table/parts/counterparty-row-actions';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const counterparty: ICounterpartyDto = {
  id: '00000000-0000-4000-8000-000000000010',
  accountingEntityId: '00000000-0000-4000-8000-000000000002',
  createdBy: '00000000-0000-4000-8000-000000000001',
  name: 'Adenike Supplies',
  status: 'active',
  type: 'organization',
  roles: ['vendor'],
  meta: {},
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('CounterpartyRowActions', () => {
  it('emits the selected counterparty for editing', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(
      <CounterpartyRowActions counterparty={counterparty} onEdit={onEdit} />
    );

    await user.click(
      screen.getByRole('button', { name: 'Open counterparty actions' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledExactlyOnceWith(counterparty);
  });

  it('confirms archive before emitting the selected counterparty', async () => {
    const onArchive = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <CounterpartyRowActions
        counterparty={counterparty}
        onArchive={onArchive}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Open counterparty actions' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Archive' }));

    const dialog = screen.getByRole('alertdialog', {
      name: 'Archive counterparty?',
    });

    expect(onArchive).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole('button', { name: 'Archive counterparty' })
    );

    expect(onArchive).toHaveBeenCalledExactlyOnceWith(counterparty);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  });

  it('keeps edit and archive unavailable for an archived counterparty', async () => {
    const user = userEvent.setup();

    render(
      <CounterpartyRowActions
        counterparty={{ ...counterparty, status: 'archived' }}
        onArchive={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Open counterparty actions' })
    );

    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute(
      'data-disabled'
    );
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveAttribute(
      'data-disabled'
    );
  });
});
