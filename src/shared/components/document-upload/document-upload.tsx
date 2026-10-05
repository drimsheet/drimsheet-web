import { Button } from '@/shared/components/button';
import {
  EFileType,
  type UFileType,
} from '@/shared/components/document-upload/types';
import { Separator } from '@/shared/components/separator';
import { cn } from '@/shared/lib/utils/cn';
import { Plus, Upload } from 'lucide-react';
import {
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
} from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend, NativeTypes } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';

type FileTypeLabelKey =
  | 'file_type_images'
  | 'file_type_pdfs'
  | 'file_type_svg'
  | 'file_type_jpegs'
  | 'file_type_pngs'
  | 'file_type_excel';

function mapAcceptToLabel(
  accept: UFileType[],
  translate: (key: FileTypeLabelKey) => string,
  locale: string
) {
  const labels = accept.map((type) => {
    switch (type) {
      case EFileType.Image:
        return translate('file_type_images');
      case EFileType.Pdf:
        return translate('file_type_pdfs');
      case EFileType.Svg:
        return translate('file_type_svg');
      case EFileType.Jpg:
      case EFileType.Jpeg:
        return translate('file_type_jpegs');
      case EFileType.Png:
        return translate('file_type_pngs');
      case EFileType.Xls:
      case EFileType.Xlsx:
        return translate('file_type_excel');
      default:
        return type;
    }
  });

  return new Intl.ListFormat(locale, {
    style: 'short',
    type: 'conjunction',
  }).format(Array.from(new Set(labels)));
}

export interface DocumentUploadProps extends ComponentProps<'div'> {
  value?: File[];
  title: string;
  description: string;
  actionText: string;
  accept: UFileType[];
  media?: ReactNode;
  allowMultiple?: boolean;
  onUpload: (files: File[]) => void;
}

type NativeFileDropItem = {
  files?: File[];
};

function formatFileDate(file: File) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(file.lastModified));
}

function isAcceptedFile(file: File, accept: string[]) {
  if (accept.length === 0) {
    return true;
  }

  return accept.some((rule) => {
    const normalizedRule = rule.trim().toLowerCase();

    if (normalizedRule === '') {
      return false;
    }

    if (normalizedRule.startsWith('.')) {
      return file.name.toLowerCase().endsWith(normalizedRule);
    }

    if (normalizedRule.endsWith('/*')) {
      return file.type
        .toLowerCase()
        .startsWith(normalizedRule.replace('/*', '/'));
    }

    return file.type.toLowerCase() === normalizedRule;
  });
}

function normalizeFiles(
  files: File[],
  accept: string[],
  allowMultiple?: boolean
) {
  const acceptedFiles = files.filter((file) => isAcceptedFile(file, accept));

  if (allowMultiple) {
    return acceptedFiles;
  }

  return acceptedFiles.slice(0, 1);
}

function useFilePreview(file: File) {
  const previewUrl = useMemo(() => {
    if (!file.type.startsWith('image/')) {
      return undefined;
    }

    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (!previewUrl) {
      return;
    }

    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return previewUrl;
}

function FilePreview({ file }: Readonly<{ file: File }>) {
  const previewUrl = useFilePreview(file);

  return (
    <div className="flex min-w-0 items-center gap-3 py-4">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted text-muted-foreground">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="size-full object-cover"
            draggable={false}
          />
        ) : (
          <Upload />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight">
          {file.name}
        </p>
        <p className="mt-1 truncate text-sm leading-none text-muted-foreground">
          {file.type.split('/')[0] || 'File'} · {formatFileDate(file)}
        </p>
      </div>
    </div>
  );
}

function DocumentUploadContent({
  value = [],
  title,
  description,
  actionText,
  accept,
  media,
  allowMultiple,
  onUpload,
  className,
  ...props
}: Readonly<DocumentUploadProps>) {
  const { i18n, t } = useTranslation('shared');
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFiles = value.length > 0;
  const acceptLabel = mapAcceptToLabel(accept, (key) => t(key), i18n.language);

  const acceptText = acceptLabel
    ? t('file_upload_accepts', { types: acceptLabel })
    : undefined;

  const uploadFiles = (files: File[]) => {
    const nextFiles = normalizeFiles(files, accept, allowMultiple);

    if (nextFiles.length === 0) {
      return;
    }

    onUpload(allowMultiple ? [...value, ...nextFiles] : nextFiles);
  };

  const [{ isOver, canDrop }, dropRef] = useDrop<
    NativeFileDropItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: [NativeTypes.FILE],
      drop: (item) => uploadFiles(item.files ?? []),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [accept, allowMultiple, onUpload, value]
  );

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    uploadFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  return (
    <div
      ref={(node) => {
        dropRef(node);
      }}
      className={cn(
        'w-full rounded-lg outline-none transition-colors',
        isOver && canDrop && 'bg-muted/40',
        className
      )}
      {...props}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        accept={accept.join(',')}
        multiple={allowMultiple}
        onChange={handleInputChange}
      />

      {!hasFiles ? (
        <div className="flex min-h-80 flex-col items-center justify-center gap-6 rounded-lg border border-dashed border-border px-6 py-12 text-center">
          <div className="flex flex-col items-center gap-5">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg:not([class*='size-'])]:size-5">
              {media ?? <Upload />}
            </div>
            <div className="flex max-w-lg flex-col gap-2">
              <h3 className="text-base font-semibold leading-tight">{title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button type="button" variant="secondary" onClick={openFilePicker}>
              {actionText}
            </Button>
            {acceptText && (
              <p className="text-xs leading-none text-muted-foreground">
                {acceptText}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {allowMultiple && (
            <>
              <button
                type="button"
                className="flex w-fit items-center gap-3 rounded-md py-4 pr-3 text-sm font-medium outline-none transition-colors hover:text-primary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                onClick={openFilePicker}
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg:not([class*='size-'])]:size-5">
                  <Plus />
                </span>
                <span className="flex flex-col items-start gap-1">
                  <span>{actionText}</span>
                  {acceptText && (
                    <span className="text-xs leading-none text-muted-foreground">
                      {acceptText}
                    </span>
                  )}
                </span>
              </button>
              <Separator />
            </>
          )}

          <div className="flex flex-col">
            {value.map((file, index) => (
              <div key={`${file.name}-${file.lastModified}-${index}`}>
                <FilePreview file={file} />
                {index < value.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentUpload(props: Readonly<DocumentUploadProps>) {
  return (
    <DndProvider backend={HTML5Backend}>
      <DocumentUploadContent {...props} />
    </DndProvider>
  );
}

export { DocumentUpload };
