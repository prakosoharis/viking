// Upload limits per session — every session is sent as ONE email with all files attached.
// Brevo allows 20MB per transactional email (content + attachments), and attachments are
// base64-encoded (~33% larger), so the raw total must stay around 14MB.
// Whichever limit is hit first (file count or total size) rejects the upload.
const MAX_FILES = parseInt(process.env.EMAIL_MAX_FILES, 10) || 5;
const MAX_TOTAL_MB = parseFloat(process.env.EMAIL_MAX_TOTAL_MB) || 14;
const MAX_TOTAL_BYTES = Math.floor(MAX_TOTAL_MB * 1024 * 1024);

const formatMB = (bytes) => (bytes / 1024 / 1024).toFixed(1);

// Returns an error message when the upload exceeds a limit, otherwise null
function checkUploadLimits(fileSizes) {
  if (fileSizes.length > MAX_FILES) {
    return `Maximum ${MAX_FILES} files per upload (you selected ${fileSizes.length}).`;
  }

  const totalBytes = fileSizes.reduce((sum, size) => sum + size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    return `Total size ${formatMB(totalBytes)} MB exceeds the ${MAX_TOTAL_MB} MB limit per upload.`;
  }

  return null;
}

module.exports = {
  MAX_FILES,
  MAX_TOTAL_MB,
  MAX_TOTAL_BYTES,
  formatMB,
  checkUploadLimits
};
