export const isPDF = (filename: string, mimeType?: string): boolean => {
  return (
    mimeType === 'application/pdf' ||
    filename.toLowerCase().endsWith('.pdf')
  );
};

export const getMimeType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeTypes: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
    pdf: 'application/pdf',
  };
  return mimeTypes[extension] || 'image/jpeg';
};

export const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const extension = originalName.split('.').pop() || 'jpg';
  return `${timestamp}-${random}.${extension}`;
};
