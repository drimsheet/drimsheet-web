import { drimsheetApi } from '@/shared/lib/api';
import { EFileUploadPurpose, type IFileUploadDto } from '@/shared/lib/api/Api';
import axios from 'axios';

async function upload(file: File): Promise<IFileUploadDto> {
  const uploadInstructionResponse = await drimsheetApi.files.preSignUploads([
    {
      name: file.name,
      type: file.type,
      size: file.size,
      purpose: EFileUploadPurpose.JournalEntryAttachment,
    },
  ]);

  const uploadInstruction = uploadInstructionResponse.data[0];

  if (!uploadInstruction) throw new Error('Missing file upload instruction');

  await axios.put(uploadInstruction.uploadUrl, file, {
    headers: uploadInstruction.headers,
  });

  return uploadInstruction;
}

async function uploadFile(file: File): Promise<string> {
  const uploadInstruction = await upload(file);

  return uploadInstruction.reference;
}

async function uploadAttachment(file: File) {
  const uploadInstruction = await upload(file);

  return uploadInstruction.file;
}

export const fileUploadService = Object.freeze({
  uploadAttachment,
  uploadFile,
});
