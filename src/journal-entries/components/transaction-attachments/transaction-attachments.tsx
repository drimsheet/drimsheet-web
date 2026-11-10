import { DocumentUpload, EFileType } from '@/shared/components/document-upload';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ALLOWED_DOCUMENT_TYPES = [
  EFileType.Png,
  EFileType.Jpg,
  EFileType.Jpeg,
  EFileType.Svg,
  EFileType.Pdf,
  EFileType.Xls,
  EFileType.Xlsx,
];

export function TransactionAttachments() {
  const { t } = useTranslation('journal-entries');
  const [files, setFiles] = useState<File[]>([]);

  const upload_title = t('upload_title');
  const upload_description = t('upload_description');
  const upload_action = t('upload_action');

  return (
    <DocumentUpload
      className="bg-neutral-100 dark:bg-card"
      title={upload_title}
      description={upload_description}
      actionText={upload_action}
      value={files}
      onUpload={setFiles}
      allowMultiple
      accept={ALLOWED_DOCUMENT_TYPES}
    />
  );
}
