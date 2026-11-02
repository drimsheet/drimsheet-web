import type { ReactNode } from 'react';

export interface TransactionCreationContentProps {
  children: ReactNode;
  files: File[];
  onUpload: (files: File[]) => void;
}
