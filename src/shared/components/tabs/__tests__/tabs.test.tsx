import { Tabs } from '@/shared/components/tabs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

const items = [
  { value: 'inflow', label: 'Inflow' },
  { value: 'outflow', label: 'Outflow' },
  { value: 'transfer', label: 'Transfer' },
];

describe('Tabs', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the same highlight aligned with externally selected tabs of different widths', () => {
    // JSDOM has no layout; supply browser measurements for the actual buttons.
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.textContent === 'Transfer' ? 184 : 4;
      }
    );
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.textContent === 'Transfer' ? 110 : 80;
      }
    );
    vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockReturnValue(4);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(36);

    const props = {
      ariaLabel: 'Transaction type',
      items,
      onValueChange: vi.fn(),
    };

    const { rerender } = render(<Tabs {...props} value="inflow" />);

    const highlight = screen
      .getByRole('tablist')
      .querySelector('[aria-hidden="true"]');

    expect(highlight).toHaveStyle({
      transform: 'translate(4px, 4px)',
      width: '80px',
      height: '36px',
    });

    rerender(<Tabs {...props} value="transfer" />);

    expect(
      screen.getByRole('tablist').querySelector('[aria-hidden="true"]')
    ).toBe(highlight);
    expect(highlight).toHaveStyle({
      transform: 'translate(184px, 4px)',
      width: '110px',
    });
    expect(screen.getByRole('tab', { name: 'Transfer' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    rerender(<Tabs {...props} value="missing" />);

    expect(
      screen.getByRole('tablist').querySelector('[aria-hidden="true"]')
    ).toBeNull();
  });

  it('emits the selected tab value on click', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs
        ariaLabel="Transaction type"
        items={items}
        value="inflow"
        onValueChange={onValueChange}
      />
    );

    await user.click(screen.getByRole('tab', { name: 'Transfer' }));

    expect(onValueChange).toHaveBeenCalledWith('transfer');
  });

  it('moves selection with arrow keys', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs
        ariaLabel="Transaction type"
        items={items}
        value="inflow"
        onValueChange={onValueChange}
      />
    );

    await user.click(screen.getByRole('tab', { name: 'Inflow' }));
    await user.keyboard('{ArrowRight}');

    expect(onValueChange).toHaveBeenCalledWith('outflow');
  });

  it('moves to the first and last enabled tabs with Home and End', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs
        ariaLabel="Transaction type"
        items={items}
        value="inflow"
        onValueChange={onValueChange}
      />
    );

    await user.click(screen.getByRole('tab', { name: 'Transfer' }));
    onValueChange.mockClear();
    await user.keyboard('{Home}');
    expect(onValueChange).toHaveBeenLastCalledWith('inflow');

    await user.click(screen.getByRole('tab', { name: 'Inflow' }));
    onValueChange.mockClear();
    await user.keyboard('{End}');
    expect(onValueChange).toHaveBeenLastCalledWith('transfer');
  });
});
