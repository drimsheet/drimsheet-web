import { CategoryForm } from '@/account/components/category-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('CategoryForm', () => {
  it('requires a nonblank name and submits validated category values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <CategoryForm
        initialValues={{ name: '' }}
        pending={false}
        error={false}
        onCancel={() => {}}
        onSubmit={onSubmit}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(
      await screen.findByText('Enter a category name.')
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('Category name'), 'Consulting');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenCalledWith(
      { name: 'Consulting' },
      expect.anything()
    );
  });

  it('limits editing to the name and preserves input on failure', () => {
    render(
      <CategoryForm
        initialValues={{
          name: 'Rent',
        }}
        pending={false}
        error
        onCancel={() => {}}
        onSubmit={async () => {}}
      />
    );
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Category name')).toHaveValue('Rent');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'We couldn’t save this category.'
    );
  });
});
