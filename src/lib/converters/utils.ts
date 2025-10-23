/**
 * Utility functions for converter tools
 */

import { UploadedFile } from './types';

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

/**
 * Validate file type against accepted types
 */
export function validateFileType(file: File, acceptedTypes: string): boolean {
  if (acceptedTypes === '*') return true;
  
  const types = acceptedTypes.split(',').map(t => t.trim());
  const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
  
  return types.some(type => {
    if (type.startsWith('.')) {
      return fileExt === type;
    }
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.replace('/*', ''));
    }
    return file.type === type;
  });
}

/**
 * Generate unique ID for files
 */
export function generateFileId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * Download a file from blob data
 */
export function downloadFile(data: BlobPart, fileName: string, mimeType: string = 'application/octet-stream') {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Read file as data URL (base64)
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Read file as array buffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Simulate conversion progress (for demo purposes)
 */
export function simulateProgress(
  onProgress: (progress: number) => void,
  duration: number = 2000
): Promise<void> {
  return new Promise((resolve) => {
    let progress = 0;
    const steps = 20;
    const interval = duration / steps;
    
    const timer = setInterval(() => {
      progress += 100 / steps;
      
      if (progress >= 100) {
        clearInterval(timer);
        onProgress(100);
        resolve();
      } else {
        onProgress(Math.min(progress, 100));
      }
    }, interval);
  });
}

/**
 * Get file extension
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * Change file extension
 */
export function changeFileExtension(fileName: string, newExtension: string): string {
  const parts = fileName.split('.');
  if (parts.length > 1) {
    parts[parts.length - 1] = newExtension;
    return parts.join('.');
  }
  return `${fileName}.${newExtension}`;
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize: number): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds limit (${formatFileSize(maxSize)})`
    };
  }
  return { valid: true };
}

/**
 * Create preview for image files
 */
export function createImagePreview(file: File): Promise<string> {
  return readFileAsDataURL(file);
}

/**
 * Detect file type category
 */
export function getFileCategory(file: File | UploadedFile): string {
  const mimeType = file.type;
  
  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType.startsWith('video/')) return 'Video';
  if (mimeType.startsWith('audio/')) return 'Audio';
  if (mimeType.includes('pdf')) return 'Document';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Document';
  if (mimeType.includes('sheet') || mimeType.includes('csv')) return 'Spreadsheet';
  if (mimeType.includes('presentation')) return 'Presentation';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return 'Archive';
  if (mimeType.includes('json') || mimeType.includes('xml')) return 'Data';
  
  return 'Other';
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Debounce function for input handling
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate compression ratio
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): string {
  const ratio = ((originalSize - compressedSize) / originalSize) * 100;
  return ratio.toFixed(1) + '%';
}

/**
 * Sanitize filename for download
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

