function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;

  const kilobytes = size / 1024;
  if (kilobytes < 1024) return `${Math.round(kilobytes)} KB`;

  const megabytes = kilobytes / 1024;

  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

const transactionDetailsHelpers = Object.freeze({
  formatFileSize,
});

export default transactionDetailsHelpers;
