import { DocumentUpload, EFileType } from '@/shared/components/document-upload';
import { useTranslation } from 'react-i18next';
import type { TransactionCreationContentProps } from './types';

const ALLOWED_DOCUMENT_TYPES = [
  EFileType.Png,
  EFileType.Jpg,
  EFileType.Jpeg,
  EFileType.Svg,
  EFileType.Pdf,
  EFileType.Xls,
  EFileType.Xlsx,
];

export function TransactionCreationContent({
  children,
  files,
  onUpload,
}: Readonly<TransactionCreationContentProps>) {
  const { t } = useTranslation('journal-entries');

  const upload_title = t('upload_title');
  const upload_description = t('upload_description');
  const upload_action = t('upload_action');

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] lg:gap-20">
      {children}
      <DocumentUpload
        className="bg-neutral-100 dark:bg-card"
        title={upload_title}
        description={upload_description}
        actionText={upload_action}
        value={files}
        onUpload={onUpload}
        allowMultiple
        accept={ALLOWED_DOCUMENT_TYPES}
      />
    </div>
  );
}
