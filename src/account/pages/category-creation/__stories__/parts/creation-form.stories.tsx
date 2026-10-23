import categoryCreationHelpers from '@/account/pages/category-creation/helper';
import { CategoryCreationForm } from '@/account/pages/category-creation/parts/creation-form';
import type {
  ICategoryCreationFormValues,
  TCategoryAccount,
} from '@/account/pages/category-creation/types';
import { categoryCreationSchema } from '@/account/pages/category-creation/validation';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useFormik, type FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';

const accounts: TCategoryAccount[] = [
  {
    id: 'expenses' as TCategoryAccount['id'],
    name: 'Operating expenses',
    code: '5100',
    type: 'expense',
    behavior: 'rent_and_utilities',
    isControlAccount: true,
    status: 'active',
    children: [
      {
        id: 'utilities' as TCategoryAccount['id'],
        name: 'Utilities',
        code: '5101',
        type: 'expense',
        behavior: 'rent_and_utilities',
        isControlAccount: false,
        status: 'active',
        children: [],
      },
    ],
  },
];

const meta = {
  title: 'Ledger Accounts/Category Creation/Form',
  component: CategoryCreationForm,
  tags: ['autodocs'],
  args: {
    accounts,
    loadingAccounts: false,
    accountsError: false,
    pending: false,
    error: false,
    parent: null,
    form: {} as FormikProps<ICategoryCreationFormValues>,
    onTypeChange: () => {},
    onParentChange: () => {},
    onPickerOpenChange: () => {},
    onCancel: () => {},
  },
  render: function Render(args) {
    const { t } = useTranslation('ledger-accounts');

    const form: FormikProps<ICategoryCreationFormValues> =
      useFormik<ICategoryCreationFormValues>({
        initialValues: {
          type: args.parent ? 'expense' : '',
          parentId: args.parent?.account.id ?? '',
          name: '',
          postingAccountName: '',
        },
        validationSchema: () => categoryCreationSchema(t, parent),
        onSubmit: async () => {},
      });

    const parent = categoryCreationHelpers.findParent(
      accounts,
      form.values.parentId
    );

    return (
      <div className="max-w-2xl">
        <CategoryCreationForm
          {...args}
          form={form}
          parent={parent}
          onTypeChange={(type) =>
            void form.setValues({
              ...form.values,
              type: type as ICategoryCreationFormValues['type'],
              parentId: '',
              postingAccountName: '',
            })
          }
          onParentChange={(parentId) =>
            void form.setFieldValue('parentId', parentId)
          }
        />
      </div>
    );
  },
} satisfies Meta<typeof CategoryCreationForm>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const PostingParent: Story = {
  args: {
    parent: {
      account: accounts[0].children[0],
      path: ['Operating expenses', 'Utilities'],
    },
  },
};
export const ControlParent: Story = {
  args: { parent: { account: accounts[0], path: ['Operating expenses'] } },
};
export const Saving: Story = { args: { pending: true } };
export const SaveFailure: Story = { args: { error: true } };
