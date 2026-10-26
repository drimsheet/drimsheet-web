import { ProfilePreferences } from '@/user/pages/profile/parts/profile-preferences';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('ProfilePreferences', () => {
  it('emits only the changed preference and keeps the saved choice until confirmed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ProfilePreferences
        preferences={{ theme: 'light', appUsageMode: 'non_power_user' }}
        onChange={onChange}
      />
    );
    await user.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(onChange).toHaveBeenLastCalledWith({ theme: 'dark' });
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: /^Manual/ }));
    expect(onChange).toHaveBeenLastCalledWith({ appUsageMode: 'power_user' });
  });

  it('prevents overlapping updates while saving', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ProfilePreferences
        preferences={{ theme: 'light', appUsageMode: 'non_power_user' }}
        onChange={onChange}
        isSaving
      />
    );
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }

    await user.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Saving preferences…');
  });
});
