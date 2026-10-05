import { CounterpartyForm } from '@/counterparty/components/counterparty-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('CounterpartyForm', () => {
  it('renders name input and type select with default value', () => {
    render(<CounterpartyForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CounterpartyForm onSubmit={onSubmit} />);

    // Submit empty form
    await user.click(screen.getByRole('button', { name: /Create/i }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits form with correct values when valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CounterpartyForm onSubmit={onSubmit} />);

    const nameInput = screen.getByLabelText(/Name/i);
    await user.type(nameInput, 'Alice Cooper');

    // Click submit
    await user.click(screen.getByRole('button', { name: /Create/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Alice Cooper',
      type: 'individual',
    });
  });

  it('respects initialValues prop', () => {
    render(
      <CounterpartyForm
        onSubmit={vi.fn()}
        initialValues={{ name: 'Bob Marley', type: 'organization' }}
      />
    );

    expect(screen.getByLabelText(/Name/i)).toHaveValue('Bob Marley');
    expect(screen.getByRole('combobox', { name: /Type/i })).toHaveTextContent(
      'Organization'
    );
  });

  it('respects disabled and loading props', () => {
    const { rerender } = render(
      <CounterpartyForm onSubmit={vi.fn()} disabled />
    );

    expect(screen.getByLabelText(/Name/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Create/i })).toBeDisabled();

    rerender(<CounterpartyForm onSubmit={vi.fn()} loading />);
    expect(screen.getByLabelText(/Name/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });
});

it('supports update actions and preserves the locked type when submitting other edits', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(
    <CounterpartyForm
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel="Save changes"
      typeRestriction={{
        value: 'organization',
        description: 'Already used in a transaction.',
      }}
      initialValues={{ name: 'Original', type: 'individual' }}
    />
  );
  expect(screen.getByRole('combobox', { name: 'Type' })).toBeDisabled();
  expect(
    screen.getByRole('combobox', { name: 'Type' })
  ).toHaveAccessibleDescription('Already used in a transaction.');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'Original', type: 'organization' })
  );
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onCancel).toHaveBeenCalledOnce();
});
