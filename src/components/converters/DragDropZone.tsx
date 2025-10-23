'use client';

import { useState, useCallback, useRef } from 'react';
import { UploadCloud, File, X, AlertCircle } from 'react-feather';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File;
  preview?: string;
}

interface DragDropZoneProps {
  onFilesAdded: (files: UploadedFile[]) => void;
  onFileRemove: (id: string) => void;
  uploadedFiles: UploadedFile[];
  acceptedFileTypes?: string;
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  allowMultiple?: boolean;
  showPreview?: boolean;
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DragDropZone({
  onFilesAdded,
  onFileRemove,
  uploadedFiles,
  acceptedFileTypes = '*',
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  allowMultiple = true,
  showPreview = false,
  icon,
  title = 'Drop your files here',
  subtitle = 'or click to browse'
}: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const validateFiles = (files: File[]): { valid: File[], errors: string[] } => {
    const errors: string[] = [];
    const valid: File[] = [];

    // Check total file count
    if (uploadedFiles.length + files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return { valid, errors };
    }

    files.forEach(file => {
      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: exceeds ${formatFileSize(maxFileSize)} limit`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  const processFiles = (fileList: File[]) => {
    setError(null);
    
    const { valid, errors } = validateFiles(fileList);

    if (errors.length > 0) {
      setError(errors.join(', '));
      setTimeout(() => setError(null), 5000);
    }

    if (valid.length === 0) return;

    const newFiles: UploadedFile[] = valid.map(file => {
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      };

      // Generate preview for images
      if (showPreview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      return uploadedFile;
    });

    onFilesAdded(newFiles);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [uploadedFiles.length, maxFiles, maxFileSize]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  }, [uploadedFiles.length, maxFiles, maxFileSize]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();

    const iconClass = "w-5 h-5";
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext || '')) {
      return <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <File className={`${iconClass} text-blue-600`} />
      </div>;
    }
    
    return <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
      <File className={`${iconClass} text-gray-600`} />
    </div>;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`dashed-border transition-all cursor-pointer ${
          isDragging ? 'dragging bg-indigo-50' : 'bg-white/50'
        }`}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-4">
            {icon || <UploadCloud className="w-14 h-14 text-indigo-600" />}
          </div>
          <p className="text-indigo-600 text-lg font-medium mb-2">
            {title}
          </p>
          <p className="text-gray-500 text-sm">
            {subtitle}
          </p>
          <div className="text-center text-xs text-gray-400 space-y-1 mt-3">
            <p>Maximum {maxFiles} files, {formatFileSize(maxFileSize)} per file</p>
            {acceptedFileTypes !== '*' && (
              <p>Accepted: {acceptedFileTypes}</p>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept={acceptedFileTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-700 font-medium">Upload Error</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          {uploadedFiles.map(file => (
            <div
              key={file.id}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              {showPreview && file.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={file.preview} 
                  alt={file.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                getFileIcon(file.name)
              )}
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate text-sm">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove(file.id);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

