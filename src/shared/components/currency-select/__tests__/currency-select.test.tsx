import { CurrencySelect } from '@/shared/components/currency-select';
import uiCurrencies from '@/shared/configs/currencies.json' with { type: 'json' };
import type { ICurrencyDto } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const dummycurrencies: ICurrencyDto[] = uiCurrencies.map((c) => ({
  code: c.code,
  symbol: c.symbol,
  name: c.name,
  minorUnit: c.minorUnit,
}));

describe('CurrencySelect', () => {
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
  it('renders correctly with no initial value', () => {
    const onChange = vi.fn();
    render(
      <CurrencySelect
        label="Currency"
        value=""
        onChange={onChange}
        currencies={dummycurrencies}
      />
    );

    expect(screen.getByText('Currency')).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Currency' })
    ).toBeInTheDocument();
  });

  it('renders with an initial value and displays the logo', () => {
    const onChange = vi.fn();
    render(
      <CurrencySelect
        label="Currency"
        value="NGN"
        onChange={onChange}
        currencies={dummycurrencies}
      />
    );

    // Since NGN is selected, checking for the background image
    const logoDivs = document.querySelectorAll(
      'div[style*="background-image"]'
    );

    const hasNgIcon = Array.from(logoDivs).some((div) => {
      const element = div as HTMLElement;

      return element.style.backgroundImage.includes('ng.png');
    });

    expect(hasNgIcon).toBe(true);
    expect(screen.getByRole('combobox')).toHaveValue('Nigerian Naira');
  });

  it('opens the select and chooses a currency', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CurrencySelect
        label="Currency"
        value=""
        onChange={onChange}
        currencies={dummycurrencies}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Currency' });
    await user.click(trigger);

    // Option should be visible
    const option = await screen.findByRole('option', {
      name: /Nigerian Naira/i,
    });

    expect(option).toBeInTheDocument();

    await user.click(option);

    expect(onChange).toHaveBeenCalledWith('NGN');
  });

  it('displays an error when error prop is provided', () => {
    const onChange = vi.fn();
    render(
      <CurrencySelect
        label="Currency"
        value=""
        onChange={onChange}
        error={[{ message: 'Currency is required' }]}
        currencies={dummycurrencies}
      />
    );

    expect(screen.getByText('Currency is required')).toBeInTheDocument();
  });

  it('displays the currency code in the trigger when displayCode is true', () => {
    const onChange = vi.fn();
    render(
      <CurrencySelect
        label="Currency"
        value="NGN"
        onChange={onChange}
        displayCode
        currencies={dummycurrencies}
      />
    );

    expect(screen.getByRole('combobox')).toHaveValue('NGN');
  });

  it('handles invalid initial value gracefully', () => {
    const onChange = vi.fn();
    render(
      <CurrencySelect
        label="Currency"
        value="INVALID"
        onChange={onChange}
        currencies={dummycurrencies}
      />
    );

    expect(
      screen.getByRole('combobox', { name: 'Currency' })
    ).toBeInTheDocument();
  });
});
