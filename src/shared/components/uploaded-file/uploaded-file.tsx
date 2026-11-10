import { Button } from '@/shared/components/button';
import { Paperclip, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import uploadedFileHelpers from './helper';
import type { UploadedFileProps } from './types';

export function UploadedFile({
  disabled,
  name,
  onRemove,
  size,
  type,
  url,
}: Readonly<UploadedFileProps>) {
  const { t } = useTranslation('shared');
  const fileType = type.split('/').at(-1)?.toUpperCase() || type;
  const open_file_label = t('uploaded_file_open_label', { name });
  const remove_file_label = t('uploaded_file_remove_label', { name });

  const fileClassName =
    'flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-muted/40 p-3 text-sm';

  const fileDetails = (
    <>
      <Paperclip
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
      <span className="min-w-0">
        <span className="block truncate font-medium">{name}</span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {fileType} · {uploadedFileHelpers.formatFileSize(size)}
        </span>
      </span>
    </>
  );

  return (
    <div className="flex items-center gap-2">
      {url ? (
        <a
          aria-label={open_file_label}
          className={`${fileClassName} outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring`}
          href={url}
          rel="noreferrer"
          target="_blank"
        >
          {fileDetails}
        </a>
      ) : (
        <div className={fileClassName}>{fileDetails}</div>
      )}
      {onRemove && (
        <Button
          aria-label={remove_file_label}
          disabled={disabled}
          onClick={onRemove}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <X />
        </Button>
      )}
    </div>
  );
}
