import { ProfileForm } from '@/user/components/profile-form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const initialValues = { firstName: 'Amara', lastName: 'Okafor' };

describe('ProfileForm', () => {
  it('starts with saved names and submits edited values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <ProfileForm
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await user.clear(screen.getByLabelText('First name'));
    await user.type(screen.getByLabelText('First name'), 'Ada');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        firstName: 'Ada',
        lastName: 'Okafor',
      })
    );
  });

  it('rejects empty and whitespace-only names with associated errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ProfileForm
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );
    await user.clear(screen.getByLabelText('First name'));
    await user.type(screen.getByLabelText('First name'), '   ');
    await user.clear(screen.getByLabelText('Last name'));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Enter your last name.')).toBeVisible();
    expect(screen.getByLabelText('First name')).toHaveAccessibleDescription(
      'Enter your first name.'
    );
    expect(screen.getByLabelText('Last name')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables editing and actions during a save', () => {
    render(
      <ProfileForm
        initialValues={initialValues}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSaving
      />
    );
    expect(screen.getByLabelText('First name')).toBeDisabled();
    expect(screen.getByLabelText('Last name')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
