import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/card';
import { useTranslation } from 'react-i18next';
import type { PromotionPreviewProps } from '../types';

export function PromotionPreview({
  parentName,
  postingAccountName,
  categoryName,
}: Readonly<PromotionPreviewProps>) {
  const { t } = useTranslation('ledger-accounts');
  const title = t('category_creation_preview_title');
  const control_label = t('category_creation_preview_control');
  const posting_label = t('category_creation_preview_posting');
  const category_label = t('category_creation_preview_category');

  const posting_name =
    postingAccountName.trim() || t('category_creation_posting_placeholder');

  const category_name =
    categoryName.trim() || t('category_creation_name_placeholder');

  return (
    <Card size="sm" aria-label={title}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="break-all font-medium">{parentName}</span>
          <span className="text-xs text-muted-foreground">{control_label}</span>
        </div>
        <ul className="mt-3 ml-2 flex flex-col gap-3 border-l border-border pl-4">
          <li className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="break-all">{posting_name}</span>
            <span className="text-xs text-muted-foreground">
              {posting_label}
            </span>
          </li>
          <li className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="break-all">{category_name}</span>
            <span className="text-xs text-muted-foreground">
              {category_label}
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
