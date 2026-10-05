import { drimsheetApi } from '@/shared/lib/api';
import { EFileUploadPurpose, type IFileUploadDto } from '@/shared/lib/api/Api';
import { fileUploadService } from '@/shared/lib/services/file-upload.service';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/api', () => ({
  drimsheetApi: { files: { preSignUploads: vi.fn() } },
}));

vi.mock('axios', () => ({ default: { put: vi.fn() } }));

const uploadInstruction = {
  uploadUrl: 'https://uploads.example.com/file?signature=secret',
  reference: 'upload-reference-1',
  headers: { 'Content-Type': 'image/png' },
  file: {
    url: 'https://uploads.example.com/file',
    name: 'receipt.png',
    type: 'image/png',
    size: 12,
  },
} satisfies IFileUploadDto;

describe('fileUploadService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('prepares and uploads one journal-entry attachment', async () => {
    const file = new File(['file-content'], 'receipt.png', {
      type: 'image/png',
    });

    vi.mocked(drimsheetApi.files.preSignUploads).mockResolvedValue({
      data: [uploadInstruction],
    } as never);
    vi.mocked(axios.put).mockResolvedValue({} as never);

    await expect(fileUploadService.uploadFile(file)).resolves.toBe(
      'upload-reference-1'
    );
    expect(drimsheetApi.files.preSignUploads).toHaveBeenCalledWith([
      {
        name: 'receipt.png',
        type: 'image/png',
        size: file.size,
        purpose: EFileUploadPurpose.JournalEntryAttachment,
      },
    ]);
    expect(axios.put).toHaveBeenCalledWith(uploadInstruction.uploadUrl, file, {
      headers: uploadInstruction.headers,
    });
  });

  it('returns attachment metadata for journal-entry rectification', async () => {
    const file = new File(['file-content'], 'receipt.png', {
      type: 'image/png',
    });

    vi.mocked(drimsheetApi.files.preSignUploads).mockResolvedValue({
      data: [uploadInstruction],
    } as never);
    vi.mocked(axios.put).mockResolvedValue({} as never);

    await expect(fileUploadService.uploadAttachment(file)).resolves.toEqual(
      uploadInstruction.file
    );
  });

  it('rejects before direct upload when no instruction is returned', async () => {
    const file = new File(['content'], 'receipt.png', { type: 'image/png' });
    vi.mocked(drimsheetApi.files.preSignUploads).mockResolvedValue({
      data: [],
    } as never);

    await expect(fileUploadService.uploadFile(file)).rejects.toThrow(
      'Missing file upload instruction'
    );
    expect(axios.put).not.toHaveBeenCalled();
  });

  it('propagates direct-upload failures', async () => {
    const error = new Error('Upload unavailable');
    const file = new File(['content'], 'receipt.png', { type: 'image/png' });
    vi.mocked(drimsheetApi.files.preSignUploads).mockResolvedValue({
      data: [uploadInstruction],
    } as never);
    vi.mocked(axios.put).mockRejectedValue(error);

    await expect(fileUploadService.uploadFile(file)).rejects.toBe(error);
  });
});
