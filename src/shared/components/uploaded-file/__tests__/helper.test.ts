import uploadedFileHelpers from '@/shared/components/uploaded-file/helper';
import { describe, expect, it } from 'vitest';

describe('uploadedFileHelpers', () => {
  it('formats attachment sizes for bytes, kilobytes, and megabytes', () => {
    expect(uploadedFileHelpers.formatFileSize(950)).toBe('950 B');
    expect(uploadedFileHelpers.formatFileSize(2048)).toBe('2 KB');
    expect(uploadedFileHelpers.formatFileSize(1_572_864)).toBe('1.5 MB');
  });
});
