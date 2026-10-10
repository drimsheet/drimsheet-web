import { CounterpartyRowActions } from '@/counterparty/components/counterparties-table/parts/counterparty-row-actions';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { act, render, screen, waitFor } from '@testing-library/react';
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
    const archiveAction = screen.getByRole('menuitem', { name: 'Archive' });

    expect(archiveAction).toHaveAttribute('data-variant', 'default');
    await user.click(archiveAction);

    const dialog = screen.getByRole('alertdialog', {
      name: 'Archive counterparty?',
    });

    expect(onArchive).not.toHaveBeenCalled();

    const archiveButton = screen.getByRole('button', {
      name: 'Archive counterparty',
    });

    expect(archiveButton).toHaveAttribute('data-variant', 'default');
    await user.click(archiveButton);

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

  it('checks deletion eligibility only after opening the menu', async () => {
    let resolveEligibility!: (canDelete: boolean) => void;

    const onCheckDeleteEligibility = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveEligibility = resolve;
        })
    );

    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <CounterpartyRowActions
        counterparty={counterparty}
        onCheckDeleteEligibility={onCheckDeleteEligibility}
        onDelete={onDelete}
      />
    );

    expect(onCheckDeleteEligibility).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole('button', { name: 'Open counterparty actions' })
    );

    expect(onCheckDeleteEligibility).toHaveBeenCalledExactlyOnceWith(
      counterparty
    );

    expect(
      screen.getByRole('menuitem', {
        name: 'Checking whether this counterparty can be deleted',
      })
    ).toBeVisible();

    await act(async () => resolveEligibility(true));

    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledExactlyOnceWith(counterparty);
  });

  it('hides delete when the counterparty is ineligible', async () => {
    const user = userEvent.setup();

    render(
      <CounterpartyRowActions
        counterparty={counterparty}
        onCheckDeleteEligibility={vi.fn().mockResolvedValue(false)}
        onDelete={vi.fn()}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Open counterparty actions' })
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('menuitem', {
          name: 'Checking whether this counterparty can be deleted',
        })
      ).not.toBeInTheDocument();
    });

    expect(
      screen.queryByRole('menuitem', { name: 'Delete' })
    ).not.toBeInTheDocument();
  });
});
