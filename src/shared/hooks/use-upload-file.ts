import { fileUploadService } from '@/shared/lib/services/file-upload.service';
import { useMutation } from '@tanstack/react-query';

export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => fileUploadService.uploadFile(file),
  });
}
