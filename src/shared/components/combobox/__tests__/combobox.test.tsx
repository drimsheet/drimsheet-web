import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/components/combobox';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('Combobox clearing', () => {
  it('clears the selection and search while keeping focus and options open', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Combobox
        items={['Software', 'Office supplies', 'Travel']}
        defaultValue="Software"
        onValueChange={onValueChange}
      >
        <ComboboxInput aria-label="Category" placeholder="Select category" />
        <ComboboxContent>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );

    const input = screen.getByRole('combobox', { name: 'Category' });

    await user.click(input);
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ reason: 'clear-press' })
    );
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findAllByRole('option')).toHaveLength(3);
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Clear selection' })
      ).not.toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: 'Open options' })).toBeVisible();

    await user.click(screen.getByRole('option', { name: 'Travel' }));

    expect(input).toHaveValue('Travel');
  });

  it('supports keyboard clearing without submitting the form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());

    render(
      <form onSubmit={onSubmit}>
        <Combobox defaultValue="Software">
          <ComboboxInput aria-label="Category" />
        </Combobox>
      </form>
    );

    await user.tab();
    await user.tab();

    expect(
      screen.getByRole('button', { name: 'Clear selection' })
    ).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('omits clearing for empty inputs and explicit opt-outs', () => {
    render(
      <>
        <Combobox>
          <ComboboxInput aria-label="Empty category" />
        </Combobox>
        <Combobox defaultValue="Software">
          <ComboboxInput aria-label="Fixed category" showClear={false} />
        </Combobox>
      </>
    );

    expect(
      screen.queryByRole('button', { name: 'Clear selection' })
    ).not.toBeInTheDocument();
  });

  it('omits clearing for disabled and read-only inputs', () => {
    render(
      <>
        <Combobox defaultValue="Software">
          <ComboboxInput aria-label="Disabled category" disabled />
        </Combobox>
        <Combobox defaultValue="Software">
          <ComboboxInput aria-label="Read-only category" readOnly />
        </Combobox>
      </>
    );

    expect(
      screen.queryByRole('button', { name: 'Clear selection' })
    ).not.toBeInTheDocument();
  });

  it('inherits read-only and disabled states from the combobox root', () => {
    render(
      <>
        <Combobox defaultValue="Software" readOnly>
          <ComboboxInput aria-label="Read-only category" />
        </Combobox>
        <Combobox defaultValue="Software" disabled>
          <ComboboxInput aria-label="Disabled category" />
        </Combobox>
      </>
    );

    expect(
      screen.getByRole('combobox', { name: 'Read-only category' })
    ).toHaveAttribute('readonly');
    expect(
      screen.getByRole('combobox', { name: 'Disabled category' })
    ).toBeDisabled();
  });
});
