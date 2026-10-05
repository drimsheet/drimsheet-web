import { MoneyInput } from '@/shared/components/money-input';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

const ControlledMoneyInput = (
  props: React.ComponentProps<typeof MoneyInput>
) => {
  const [val, setVal] = useState(props.value || '');

  return (
    <MoneyInput
      {...props}
      value={val}
      onChange={(e) => {
        setVal(e.target.value);
        if (props.onChange) props.onChange(e);
      }}
    />
  );
};

describe('MoneyInput', () => {
  it('renders correctly', () => {
    render(<MoneyInput aria-label="Amount" />);
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
  });

  it('renders a non-finite controlled value as an empty input', () => {
    render(<MoneyInput aria-label="Amount" value={Number.NaN} />);

    expect(screen.getByLabelText('Amount')).toHaveValue('');
  });

  it('formats input values correctly', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <ControlledMoneyInput
        aria-label="Amount"
        locale="en-US"
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText('Amount');
    await user.type(input, '1234.56');

    expect(input).toHaveValue('1,234.56');
  });

  it('allows negative values', async () => {
    const user = userEvent.setup();
    render(<ControlledMoneyInput aria-label="Amount" locale="en-US" />);

    const input = screen.getByLabelText('Amount');
    await user.type(input, '-1000');

    expect(input).toHaveValue('-1,000');
  });

  it('cleans up hanging decimal points on blur', async () => {
    const user = userEvent.setup();
    render(<ControlledMoneyInput aria-label="Amount" locale="en-US" />);

    const input = screen.getByLabelText('Amount');
    await user.type(input, '12.');
    expect(input).toHaveValue('12.');

    await user.tab(); // trigger blur
    expect(input).toHaveValue('12');
  });

  it('handles empty negative sign on blur', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <ControlledMoneyInput aria-label="Amount" onChange={handleChange} />
    );

    const input = screen.getByLabelText('Amount');
    await user.type(input, '-');
    expect(input).toHaveValue('-');

    await user.tab(); // trigger blur
    expect(input).toHaveValue('');
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: '',
        }),
      })
    );
  });

  it('respects currency code formatting via value prop', () => {
    render(
      <MoneyInput
        aria-label="Amount"
        value="1234.56"
        currencyCode="USD"
        locale="en-US"
      />
    );
    const input = screen.getByLabelText('Amount');

    // Remove potential non-breaking spaces for stable test
    const val = (input as HTMLInputElement).value.replace(/\u00A0/g, ' ');
    expect(val).toBe('1,234.56');
  });

  it('uses money decimals by default', async () => {
    const user = userEvent.setup();

    render(
      <ControlledMoneyInput
        aria-label="Amount"
        currencyCode="USD"
        locale="en-US"
      />
    );

    const input = screen.getByLabelText('Amount');
    await user.type(input, '1.234');

    expect(input).toHaveValue('1.23');
  });

  it('uses the configured currency minor-unit precision in money mode', async () => {
    const user = userEvent.setup();

    render(
      <ControlledMoneyInput
        aria-label="Amount"
        currencyCode="KWD"
        locale="en-US"
      />
    );

    const input = screen.getByLabelText('Amount');
    await user.type(input, '1.2345');

    expect(input).toHaveValue('1.234');
  });

  it('uses two decimals for currency-less money values', async () => {
    const user = userEvent.setup();

    render(<ControlledMoneyInput aria-label="Amount" locale="en-US" />);

    const input = screen.getByLabelText('Amount');
    await user.type(input, '1.234');

    expect(input).toHaveValue('1.23');
  });

  it('preserves arbitrary fractional digits in number mode', async () => {
    const user = userEvent.setup();

    render(
      <ControlledMoneyInput
        aria-label="Rate"
        currencyCode="USD"
        decimalType="number"
        locale="en-US"
      />
    );

    const input = screen.getByLabelText('Rate');
    await user.type(input, '0.001234');

    expect(input).toHaveValue('0.001234');
  });

  it('triggers onChange with unformatted value', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <ControlledMoneyInput aria-label="Amount" onChange={handleChange} />
    );

    const input = screen.getByLabelText('Amount');
    await user.type(input, '1234');

    // The last call should have the clean value
    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: '1234',
        }),
      })
    );
  });
});
