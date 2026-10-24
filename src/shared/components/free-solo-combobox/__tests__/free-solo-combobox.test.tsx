import {
  FreeSoloCombobox,
  type UFreeSoloComboboxValue,
} from '@/shared/components/free-solo-combobox';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

interface IPayerOption {
  id: string;
  name: string;
}

const options: IPayerOption[] = [
  { id: 'payer-1', name: 'Alice Johnson' },
  { id: 'payer-2', name: 'Bob Smith' },
];

function ControlledCombobox({
  disabled = false,
  emptyMessage = 'No payers found',
  initialValue = null,
  onValueChange,
}: Readonly<{
  disabled?: boolean;
  emptyMessage?: string;
  initialValue?: UFreeSoloComboboxValue<IPayerOption>;
  onValueChange: (value: UFreeSoloComboboxValue<IPayerOption>) => void;
}>) {
  const [value, setValue] = useState(initialValue);

  return (
    <FreeSoloCombobox
      disabled={disabled}
      emptyMessage={emptyMessage}
      getOptionLabel={(option) => option.name}
      id="payer"
      label="Payer"
      onValueChange={(nextValue) => {
        setValue(nextValue);
        onValueChange(nextValue);
      }}
      options={options}
      placeholder="Select or enter a payer"
      value={value}
    />
  );
}

describe('FreeSoloCombobox', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.hasPointerCapture = vi.fn(
      () => false
    ) as unknown as typeof window.HTMLElement.prototype.hasPointerCapture;
    window.HTMLElement.prototype.releasePointerCapture =
      vi.fn() as unknown as typeof window.HTMLElement.prototype.releasePointerCapture;
    window.HTMLElement.prototype.setPointerCapture =
      vi.fn() as unknown as typeof window.HTMLElement.prototype.setPointerCapture;
    window.HTMLElement.prototype.scrollIntoView =
      vi.fn() as unknown as typeof window.HTMLElement.prototype.scrollIntoView;
  });

  it('renders an accessible labelled input and associated error', () => {
    render(
      <FreeSoloCombobox
        emptyMessage="No payers found"
        error={[{ message: 'Payer is required' }]}
        getOptionLabel={(option: IPayerOption) => option.name}
        id="payer"
        label="Payer"
        onValueChange={() => undefined}
        options={options}
        value={null}
      />
    );

    const input = screen.getByRole('combobox', { name: 'Payer' });

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Payer is required');
  });

  it('filters options case-insensitively', async () => {
    const user = userEvent.setup();
    render(<ControlledCombobox onValueChange={() => undefined} />);

    await user.type(screen.getByRole('combobox', { name: 'Payer' }), 'ALICE');

    expect(
      await screen.findByRole('option', { name: 'Alice Johnson' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Bob Smith' })
    ).not.toBeInTheDocument();
  });

  it('emits the original option object for pointer selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ControlledCombobox onValueChange={onValueChange} />);

    await user.click(screen.getByRole('combobox', { name: 'Payer' }));
    await user.click(await screen.findByRole('option', { name: 'Bob Smith' }));

    expect(onValueChange).toHaveBeenLastCalledWith(options[1]);
  });

  it('selects by keyboard without submitting a parent form', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ControlledCombobox onValueChange={onValueChange} />
      </form>
    );

    const input = screen.getByRole('combobox', { name: 'Payer' });
    await user.type(input, 'Bob');
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onValueChange).toHaveBeenLastCalledWith(options[1]);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('preserves and emits unmatched free text on blur', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ControlledCombobox onValueChange={onValueChange} />);

    const input = screen.getByRole('combobox', { name: 'Payer' });
    await user.type(input, 'New payer');
    await user.tab();

    expect(input).toHaveValue('New payer');
    expect(onValueChange).toHaveBeenLastCalledWith('New payer');
  });

  it('emits null when the value is cleared', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ControlledCombobox
        initialValue={options[0]}
        onValueChange={onValueChange}
      />
    );

    const input = screen.getByRole('combobox', { name: 'Payer' });

    await user.click(input);
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(await screen.findAllByRole('option')).toHaveLength(2);
  });

  it('disables interaction', () => {
    render(<ControlledCombobox disabled onValueChange={() => undefined} />);

    expect(screen.getByRole('combobox', { name: 'Payer' })).toBeDisabled();
  });

  it('renders the supplied empty state', async () => {
    const user = userEvent.setup();
    render(
      <ControlledCombobox
        emptyMessage="Nothing matches"
        onValueChange={() => undefined}
      />
    );

    await user.type(screen.getByRole('combobox', { name: 'Payer' }), 'zzz');

    expect(await screen.findByText('Nothing matches')).toBeInTheDocument();
  });
});
