import { Button } from '@/shared/components/button';
import { Checkbox } from '@/shared/components/checkbox';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/shared/components/field';
import { useId, useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import categoriesFormHelpers from './helper';
import { CreateCategoryForm } from './parts/create-category-form';
import type { CategoriesFormProps, ICategoryDraft } from './types';

export function CategoriesForm({
  kind,
  id,
  initialValues,
  disabled = false,
  onSubmit,
}: Readonly<CategoriesFormProps>) {
  const { t } = useTranslation('accounting');
  const fieldId = useId();
  const groups = categoriesFormHelpers.createGroups(t, kind);

  const [values, setValues] = useState(() =>
    categoriesFormHelpers.createInitialValues(
      groups,
      (name) => t('categories_default_label', { name }),
      initialValues
    )
  );

  const [isAdding, setIsAdding] = useState(false);
  const [hasOpenedEditor, setHasOpenedEditor] = useState(false);

  const selectedCount = values.categories.filter(
    ({ selected }) => selected
  ).length;

  const handleToggle = (id: string, selected: boolean) => {
    setValues((previous) => ({
      categories: previous.categories.map((category) =>
        category.id === id ? { ...category, selected } : category
      ),
    }));
  };

  const handleOpenEditor = () => {
    setHasOpenedEditor(true);
    setIsAdding(true);
  };

  const handleAdd = (draft: ICategoryDraft) => {
    const parent = groups.find(({ id }) => id === draft.parentId);
    if (!parent) {
      return;
    }

    setValues((previous) => ({
      categories: [
        ...previous.categories,
        {
          id: `${fieldId}-custom-${previous.categories.length}`,
          parentId: parent.id,
          name: draft.name,
          selected: true,
        },
      ],
    }));
    setIsAdding(false);
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!disabled) {
      onSubmit?.(values);
    }
  };

  const title = t('categories_recommended_title');

  const selected_text = t('categories_selected_label', {
    count: selectedCount,
  });

  const add_label = t(`${kind}_categories_add_label`);

  if (isAdding) {
    return (
      <CreateCategoryForm
        kind={kind}
        groups={groups}
        categories={values.categories}
        disabled={disabled}
        onSubmit={handleAdd}
        onCancel={() => setIsAdding(false)}
      />
    );
  }

  return (
    <form id={id} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FieldSet disabled={disabled} className="gap-4">
        <FieldLegend className="mb-4 flex w-full items-baseline justify-between gap-4">
          <span className="text-base font-semibold">{title}</span>
          <output className="shrink-0 text-xs font-normal tabular-nums text-muted-foreground">
            {selected_text}
          </output>
        </FieldLegend>
        <FieldGroup className="gap-4">
          {groups.map((group) => (
            <FieldSet key={group.id} className="gap-1">
              <FieldLegend
                variant="label"
                className="mb-0 text-sm font-semibold"
              >
                {group.name}
              </FieldLegend>
              <FieldGroup className="ml-2 w-auto gap-0 border-l pl-3">
                {values.categories
                  .filter(({ parentId }) => parentId === group.id)
                  .map((category) => (
                    <Field
                      key={category.id}
                      orientation="horizontal"
                      className="min-h-11 gap-4 pr-3"
                    >
                      <FieldLabel
                        htmlFor={`${fieldId}-${category.id}`}
                        className="min-w-0 flex-1 break-words py-2 font-normal"
                      >
                        {category.name}
                      </FieldLabel>
                      <Checkbox
                        id={`${fieldId}-${category.id}`}
                        checked={category.selected}
                        disabled={disabled}
                        onCheckedChange={(checked) =>
                          handleToggle(category.id, checked === true)
                        }
                      />
                    </Field>
                  ))}
              </FieldGroup>
            </FieldSet>
          ))}
        </FieldGroup>
      </FieldSet>
      <Button
        type="button"
        variant="outline"
        className="self-start"
        disabled={disabled}
        autoFocus={hasOpenedEditor}
        onClick={handleOpenEditor}
      >
        {add_label}
      </Button>
    </form>
  );
}
