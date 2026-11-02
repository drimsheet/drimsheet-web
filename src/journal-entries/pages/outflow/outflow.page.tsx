import { OutflowFormContainer } from '@/journal-entries/components/outflow-form';
import { TransactionCreationContent } from '@/journal-entries/components/transaction-creation-content';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { useState } from 'react';

export function OutflowPage() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <>
      <AppBody>
        <AppSection>
          <TransactionCreationContent files={files} onUpload={setFiles}>
            <OutflowFormContainer />
          </TransactionCreationContent>
        </AppSection>
      </AppBody>
    </>
  );
}
