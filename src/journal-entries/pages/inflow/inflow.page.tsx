import { InflowFormContainer } from '@/journal-entries/components/inflow-form';
import { TransactionCreationContent } from '@/journal-entries/components/transaction-creation-content';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { useState } from 'react';

export function InflowPage() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <>
      <AppBody>
        <AppSection>
          <TransactionCreationContent files={files} onUpload={setFiles}>
            <InflowFormContainer />
          </TransactionCreationContent>
        </AppSection>
      </AppBody>
    </>
  );
}
