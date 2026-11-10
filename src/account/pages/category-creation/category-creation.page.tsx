import { useRedirectAfterAccountCreation } from '@/account/hooks/use-redirect-after-account-creation';
import { categoryService } from '@/account/lib/services/category.service';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFormik, type FormikProps } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import categoryCreationHelpers from './helper';
import { CategoryCreationForm } from './parts/creation-form';
import type {
  ICategoryCreationFormValues,
  ICategoryCreationPageSearchParams,
  ICategoryParentSelection,
} from './types';
import { categoryCreationSchema } from './validation';

export function CategoryCreationPage() {
  const { t } = useTranslation('ledger-accounts');
  const [searchParams] = useSearchParams();
  const requestedType = searchParams.get('type');

  const params: ICategoryCreationPageSearchParams = {
    type:
      requestedType === 'revenue' || requestedType === 'expense'
        ? requestedType
        : undefined,
  };

  const { redirectAfterCreation, redirectAfterCancellation } =
    useRedirectAfterAccountCreation('/categories');

  const queryClient = useQueryClient();
  const [pickerOpen, setPickerOpen] = useState(false);

  const form: FormikProps<ICategoryCreationFormValues> =
    useFormik<ICategoryCreationFormValues>({
      initialValues: categoryCreationHelpers.createInitialValues(params.type),
      validationSchema: () => categoryCreationSchema(t, parent),
      onSubmit: handleSubmit,
    });

  const accountsQuery = { class: form.values.type as 'revenue' | 'expense' };

  const accounts = useQuery({
    queryKey: ['categoryService', 'getChartOfAccounts', accountsQuery],
    queryFn: () => categoryService.getChartOfAccounts(accountsQuery),
    enabled: pickerOpen && !!form.values.type,
    retry: false,
  });

  const parent: ICategoryParentSelection | null =
    categoryCreationHelpers.findParent(
      accounts.data ?? [],
      form.values.parentId
    );

  const mutation = useMutation({
    retry: false,
    mutationFn: (values: ICategoryCreationFormValues) => {
      // Submission is only reached after the selected parent passes form validation.
      const account = parent!.account;
      if (values.type === 'revenue') {
        return categoryService.createRevenue(
          categoryCreationHelpers.toRevenue(values, account)
        );
      }

      return categoryService.createExpense(
        categoryCreationHelpers.toExpense(values, account)
      );
    },
  });

  async function handleSubmit(values: ICategoryCreationFormValues) {
    try {
      const category = await mutation.mutateAsync(values);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categoryService'] }),
        queryClient.invalidateQueries({ queryKey: ['ledgerAccountService'] }),
        queryClient.invalidateQueries({
          queryKey: ['ledgerReportingService'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['accountingBootstrapService'],
        }),
      ]);
      toast.success(t('category_creation_success'));
      await redirectAfterCreation(category.id);
    } catch {
      // Keep the selected parent and both names available for correction.
    }
  }

  const handleTypeChange = (value: string) => {
    if (
      params.type !== undefined ||
      (value !== 'revenue' && value !== 'expense')
    ) {
      return;
    }

    mutation.reset();
    void form.setValues(
      {
        type: value,
        name: form.values.name,
        parentId: '',
        postingAccountName: '',
      },
      false
    );
    void form.setTouched({}, false);
    form.setErrors({});
  };

  const handleParentChange = (id: string) => {
    mutation.reset();
    void form.setValues(
      {
        ...form.values,
        parentId: id,
        postingAccountName:
          id === form.values.parentId ? form.values.postingAccountName : '',
      },
      false
    );
    void form.setFieldTouched('parentId', false, false);
    void form.setFieldTouched('postingAccountName', false, false);
    form.setErrors({});
  };

  const title = t('category_creation_title');

  const categories_label = t('categories_table_breadcrumb');

  return (
    <AppBody
      title={title}
      breadcrumbs={{
        label: categories_label,
        link: '/categories',
        next: { label: title },
      }}
    >
      <AppSection>
        <CategoryCreationForm
          form={form}
          parent={parent}
          accounts={accounts.data ?? []}
          loadingAccounts={accounts.isFetching}
          accountsError={accounts.isError}
          pending={mutation.isPending || form.isSubmitting}
          error={mutation.isError}
          disableTypeSelection={params.type !== undefined}
          onTypeChange={handleTypeChange}
          onParentChange={handleParentChange}
          onPickerOpenChange={setPickerOpen}
          onCancel={redirectAfterCancellation}
        />
      </AppSection>
    </AppBody>
  );
}
