import { BankDetailsHelp } from '@/account/components/bank-details-form/parts/bank-details-help';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

const description =
  'We collect these details to ensure accurate reconciliation and smooth transaction tracking with your financial institution.';

function renderHelp() {
  render(
    <>
      <BankDetailsHelp
        description={description}
        triggerLabel="Why are we asking for this?"
      />
      <button type="button">Next control</button>
    </>
  );

  return screen.getByRole('button', { name: 'Why are we asking for this?' });
}

describe('BankDetailsHelp', () => {
  it('keeps keyboard focus on the trigger and dismisses with Escape', async () => {
    const user = userEvent.setup();
    const trigger = renderHelp();

    await user.tab();

    expect(await screen.findByRole('tooltip')).toHaveTextContent(description);
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAccessibleDescription(description);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.tab();

    expect(screen.getByRole('button', { name: 'Next control' })).toHaveFocus();
  });

  it('dismisses when keyboard focus moves to the next control', async () => {
    const user = userEvent.setup();
    renderHelp();

    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();

    await user.tab();

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next control' })).toHaveFocus();
  });

  it('pins on click and dismisses on a second click or outside interaction', async () => {
    const user = userEvent.setup();
    const trigger = renderHelp();

    await user.click(trigger);
    await user.hover(screen.getByRole('button', { name: 'Next control' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(description);

    await user.click(trigger);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await user.click(trigger);
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next control' }));

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
