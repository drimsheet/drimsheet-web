import { InflowFormContainer } from '@/journal-entries/components/inflow-form';
import { AppBody, AppHeader } from '@/shared/components/app';
import { DocumentUpload } from '@/shared/components/document-upload';
import { EFileType } from '@/shared/components/document-upload/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ALLOWED_DOC_UPLOAD = [
  EFileType.Png,
  EFileType.Jpg,
  EFileType.Jpeg,
  EFileType.Svg,
  EFileType.Pdf,
  EFileType.Xls,
  EFileType.Xlsx,
];

export function InflowPage() {
  const { t } = useTranslation('journal-entries');

  const [files, setFiles] = useState<File[]>([]);

  const upload_title = t('upload_title');
  const upload_description = t('upload_description');
  const upload_action = t('upload_action');

  return (
    <>
      <AppHeader />
      <AppBody>
        <div className="grid gap-20 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]">
          <InflowFormContainer />
          <DocumentUpload
            title={upload_title}
            description={upload_description}
            actionText={upload_action}
            value={files}
            onUpload={setFiles}
            allowMultiple
            accept={ALLOWED_DOC_UPLOAD}
          />
        </div>
      </AppBody>
    </>
  );
}
