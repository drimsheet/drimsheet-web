import { CashTransferFormContainer } from '@/journal-entries/components/cash-transfer-form';
import { TransactionCreationContent } from '@/journal-entries/components/transaction-creation-content';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { useState } from 'react';

export function TransferPage() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <>
      <AppBody>
        <AppSection>
          <TransactionCreationContent files={files} onUpload={setFiles}>
            <CashTransferFormContainer />
          </TransactionCreationContent>
        </AppSection>
      </AppBody>
    </>
  );
}
