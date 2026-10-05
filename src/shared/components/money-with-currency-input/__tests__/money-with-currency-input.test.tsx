import * as stories from '@/shared/components/money-with-currency-input/__stories__/money-with-currency-input.stories';
import { composeStories } from '@storybook/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const { Default, WithAmount, NigerianNaira, Disabled } =
  composeStories(stories);

describe('MoneyWithCurrencyInput', () => {
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

  it('renders the default story as a combined currency and amount input', () => {
    const { container } = render(<Default />);

    const control = container.querySelector(
      '[data-slot="money-with-currency-input"]'
    );

    expect(control).toBeInTheDocument();
    expect(control).toHaveClass('flex', 'items-center', 'border');
    expect(
      screen.getByRole('combobox', { name: 'Currency: USD' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toHaveValue('0');
    expect(screen.getByLabelText('Amount')).toHaveAttribute('placeholder', '0');
  });

  it('renders the with-amount story with formatted money', () => {
    render(<WithAmount />);

    expect(
      screen.getByRole('combobox', { name: 'Currency: USD' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toHaveValue('30,000');
  });

  it('renders the Nigerian Naira story with the selected currency and logo', () => {
    const { container } = render(<NigerianNaira />);

    expect(
      screen.getByRole('combobox', { name: 'Currency: NGN' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toHaveValue('30,000');

    const logo = container.querySelector('div[style*="background-image"]');
    expect(logo).toHaveStyle({
      backgroundImage: 'url("https://flagcdn.com/w320/ng.png")',
    });
  });

  it('renders the disabled story with both controls disabled', () => {
    render(<Disabled />);

    expect(
      screen.getByRole('combobox', { name: 'Currency: USD' })
    ).toBeDisabled();
    expect(screen.getByLabelText('Amount')).toBeDisabled();
  });

  it('can fix the currency selector without dimming it', () => {
    render(<Default currencyDisabled />);

    const currencyTrigger = screen.getByRole('combobox', {
      name: 'Currency: USD',
    });

    expect(currencyTrigger).toBeDisabled();
    expect(currencyTrigger).not.toHaveClass('disabled:opacity-50');
    expect(currencyTrigger).toHaveClass('disabled:opacity-100');
    expect(
      currencyTrigger.querySelector('[data-slot="combobox-trigger-icon"]')
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).not.toBeDisabled();
  });

  it('opens a full-width currency popup from the story control', async () => {
    const user = userEvent.setup();
    render(<WithAmount />);

    await user.click(screen.getByRole('combobox', { name: 'Currency: USD' }));

    const searchInput = await screen.findByRole('combobox', {
      name: 'Search currency',
    });

    const popup = searchInput.closest('[data-slot="combobox-content"]');

    expect(searchInput).toHaveAttribute('placeholder', 'Search');
    expect(popup).toHaveClass('w-(--anchor-width)', 'min-w-(--anchor-width)');
  });

  it('filters currencies in the popup by code and country-backed search text', async () => {
    const user = userEvent.setup();
    render(<Default />);

    await user.click(screen.getByRole('combobox', { name: 'Currency: USD' }));
    await user.type(
      await screen.findByRole('combobox', { name: 'Search currency' }),
      'ngn'
    );

    expect(
      await screen.findByRole('option', { name: /Nigerian Naira/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: /US Dollar/i })
    ).not.toBeInTheDocument();
  });

  it('selects a currency from the story popup and calls the change handler', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Default onChange={onChange} />);

    await user.click(screen.getByRole('combobox', { name: 'Currency: USD' }));
    await user.type(
      await screen.findByRole('combobox', { name: 'Search currency' }),
      'ngn'
    );
    await user.click(
      await screen.findByRole('option', { name: /Nigerian Naira/i })
    );

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 0,
        currencyCode: 'NGN',
        isMinorUnit: false,
      })
    );
    expect(
      screen.getByRole('combobox', { name: 'Currency: NGN' })
    ).toBeInTheDocument();
  });

  it('keeps MoneyInput formatting behavior when typing through the story', async () => {
    const user = userEvent.setup();
    render(<Default />);

    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '1234.56');

    expect(screen.getByLabelText('Amount')).toHaveValue('1,234.56');
  });

  it('shows an empty state when no currency matches the story search', async () => {
    const user = userEvent.setup();
    render(<Default />);

    await user.click(screen.getByRole('combobox', { name: 'Currency: USD' }));
    await user.type(
      await screen.findByRole('combobox', { name: 'Search currency' }),
      'not-a-currency'
    );

    expect(screen.getByText('No currencies found.')).toBeInTheDocument();
    expect(
      within(screen.getByRole('listbox')).queryAllByRole('option')
    ).toHaveLength(0);
  });
});
