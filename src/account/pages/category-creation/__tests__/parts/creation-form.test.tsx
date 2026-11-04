import { CategoryCreationForm } from '@/account/pages/category-creation/parts/creation-form';
import type {
  ICategoryCreationFormValues,
  TCategoryAccount,
} from '@/account/pages/category-creation/types';
import { categoryCreationSchema } from '@/account/pages/category-creation/validation';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';

const postingAccount: TCategoryAccount = {
  id: 'utilities' as TCategoryAccount['id'],
  name: 'Utilities',
  code: '5101',
  type: 'expense',
  behavior: 'rent_and_utilities',
  isControlAccount: false,
  status: 'active',
  children: [],
};

const controlAccount: TCategoryAccount = {
  ...postingAccount,
  id: 'operating' as TCategoryAccount['id'],
  name: 'Operating expenses',
  code: '5100',
  isControlAccount: true,
  children: [postingAccount],
};

function FormHarness({
  onSubmit,
  disableTypeSelection,
  onTypeChange = () => {},
}: Readonly<{
  onSubmit: (values: ICategoryCreationFormValues) => Promise<void>;
  disableTypeSelection?: boolean;
  onTypeChange?: (value: string) => void;
}>) {
  const { t } = useTranslation('ledger-accounts');

  const parent = {
    account: postingAccount,
    path: ['Operating expenses', 'Utilities'],
  };

  const form = useFormik<ICategoryCreationFormValues>({
    initialValues: {
      type: 'expense',
      parentId: postingAccount.id,
      name: 'Internet',
      postingAccountName: '',
    },
    validationSchema: categoryCreationSchema(t, parent),
    onSubmit,
  });

  return (
    <CategoryCreationForm
      form={form}
      parent={parent}
      accounts={[controlAccount]}
      loadingAccounts={false}
      accountsError={false}
      pending={false}
      error={false}
      disableTypeSelection={disableTypeSelection}
      onTypeChange={onTypeChange}
      onParentChange={() => {}}
      onPickerOpenChange={() => {}}
      onCancel={() => {}}
    />
  );
}

describe('CategoryCreationForm', () => {
  it('locks only type selection while the remaining fields stay editable', async () => {
    const user = userEvent.setup();
    const onTypeChange = vi.fn();
    render(
      <FormHarness
        onSubmit={vi.fn()}
        disableTypeSelection
        onTypeChange={onTypeChange}
      />
    );

    expect(screen.getByRole('radio', { name: 'Expenses' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Expenses' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Income' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Income' }));
    expect(onTypeChange).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('Category name'), ' access');
    expect(screen.getByLabelText('Category name')).toHaveValue(
      'Internet access'
    );
    expect(
      screen.getByLabelText(/Name for cloned posting account/)
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Change parent' })).toBeEnabled();
  });

  it('requires the cloned posting name and keeps it separate from the new category', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<FormHarness onSubmit={onSubmit} />);
    expect(screen.queryByLabelText('Account behavior')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Expenses' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Expenses' })).toBeEnabled();
    expect(screen.getByRole('radio', { name: 'Income' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Create category' }));
    expect(
      await screen.findByText('Enter a name for the cloned posting account.')
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await user.type(
      screen.getByLabelText(/Name for cloned posting account/),
      'General utilities'
    );
    await user.click(screen.getByRole('button', { name: 'Create category' }));
    expect(onSubmit).toHaveBeenCalledWith(
      {
        type: 'expense',
        parentId: 'utilities',
        name: 'Internet',
        postingAccountName: 'General utilities',
      },
      expect.anything()
    );
    expect(screen.getByLabelText('After creation')).toHaveTextContent(
      'General utilities'
    );
    expect(screen.getByLabelText('After creation')).toHaveTextContent(
      'Utilities'
    );
  });
});
