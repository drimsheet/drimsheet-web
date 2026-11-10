import { Button } from '@/shared/components/button';
import { Field, FieldDescription, FieldError } from '@/shared/components/field';
import { Label } from '@/shared/components/label';
import { UploadedFile } from '@/shared/components/uploaded-file';
import { Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import type { FileUploadProps } from './types';

export function FileUpload({
  accept,
  actionText,
  description,
  disabled = false,
  errors,
  id,
  label,
  multiple = false,
  onValueChange,
  replaceText,
  value,
}: Readonly<FileUploadProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const invalid = Boolean(errors?.length);

  const buttonText =
    !multiple && value.length > 0 ? (replaceText ?? actionText) : actionText;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      onValueChange(multiple ? [...value, ...files] : files.slice(0, 1));
    }

    event.target.value = '';
  };

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    onValueChange(value.filter((_, fileIndex) => fileIndex !== index));
  };

  return (
    <Field data-invalid={invalid}>
      <Label htmlFor={id}>{label}</Label>
      <input
        ref={inputRef}
        id={id}
        accept={accept.join(',')}
        aria-invalid={invalid}
        className="sr-only"
        disabled={disabled}
        multiple={multiple}
        onChange={handleInputChange}
        type="file"
      />

      <div>
        <Button
          disabled={disabled}
          onClick={handleOpenPicker}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Upload />
          {buttonText}
        </Button>
      </div>

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((file, index) => (
            <li key={`${file.name}-${file.lastModified}-${index}`}>
              <UploadedFile
                disabled={disabled}
                name={file.name}
                onRemove={() => handleRemoveFile(index)}
                size={file.size}
                type={file.type}
              />
            </li>
          ))}
        </ul>
      )}

      <FieldDescription>{description}</FieldDescription>
      <FieldError errors={errors} />
    </Field>
  );
}
