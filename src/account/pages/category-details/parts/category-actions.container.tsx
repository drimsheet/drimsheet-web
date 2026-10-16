import { CategoryEditorDialog } from '@/account/dialogs/category-editor';
import { useState } from 'react';
import type { CategoryActionsContainerProps } from '../types';
import { CategoryActions } from './category-actions';

export function CategoryActionsContainer({
  account,
}: Readonly<CategoryActionsContainerProps>) {
  const [editOpen, setEditOpen] = useState(false);
  const type = account.type;
  const isCategory = type === 'revenue' || type === 'expense';
  const editDisabled = !isCategory || account.status === 'archived';

  return (
    <>
      <CategoryActions
        onEdit={() => setEditOpen(true)}
        editDisabled={editDisabled}
      />
      {editOpen && isCategory && !editDisabled && (
        <CategoryEditorDialog
          account={{
            accountId: account.id,
            accountName: account.name,
            type,
          }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}
