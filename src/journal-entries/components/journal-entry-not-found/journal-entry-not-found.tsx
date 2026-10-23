import type { JournalEntryNotFoundProps } from '@/journal-entries/components/journal-entry-not-found/types';
import { Button } from '@/shared/components/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/shared/components/empty';
import { PageTitle } from '@/shared/components/page-title';
import { FileQuestionIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function JournalEntryNotFound({
  onBack,
}: Readonly<JournalEntryNotFoundProps>) {
  const { t } = useTranslation<'journal-entries'>('journal-entries');

  const status_text = t('journal_entry_not_found_status');
  const title = t('journal_entry_not_found_title');
  const description = t('journal_entry_not_found_description');
  const back_action = t('journal_entry_not_found_back_action');

  return (
    <Empty className="min-h-[60vh] border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon aria-hidden="true" />
        </EmptyMedia>
        <p className="text-sm font-medium text-muted-foreground">
          {status_text}
        </p>
        <PageTitle>{title}</PageTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" onClick={onBack}>
          {back_action}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
