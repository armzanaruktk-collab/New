export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec === 0) return '0 KB/s';
  const k = 1024;
  if (bytesPerSec < k) return `${bytesPerSec} B/s`;
  if (bytesPerSec < k * k) return `${(bytesPerSec / k).toFixed(1)} KB/s`;
  return `${(bytesPerSec / (k * k)).toFixed(2)} MB/s`;
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatKeyPreview(keyText: string): string {
  if (!keyText) return '';
  const preview = keyText
    .replace(/-----BEGIN [A-Z0-9 ]+-----/g, '')
    .replace(/-----END [A-Z0-9 ]+-----/g, '')
    .trim();

  if (preview.length > 50) {
    return preview.substring(0, 24) + '•••••\n•••••' + preview.substring(preview.length() - 24);
  }
  return preview || 'Valid Private Key';
}
