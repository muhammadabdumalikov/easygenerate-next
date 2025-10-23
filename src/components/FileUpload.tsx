'use client';

import { useState, useCallback } from 'react';
import {
    UploadCloud,
    Image,
    Video,
    Music,
    File,
    Download,
    X,
    ArrowRight,
    ChevronDown,
    AlertCircle
} from 'react-feather';
import FormatSelector from './FormatSelector';

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    status: 'ready' | 'uploading' | 'converting' | 'finished' | 'failed';
    progress: number;
    type: string;
    targetFormat: string | null;
    error?: string;
}

export default function FileUpload() {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [allTargetFormat, setAllTargetFormat] = useState<string | null>(null);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
    const [showFormatSelector, setShowFormatSelector] = useState(false);

    // File size limitations
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
    const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total
    const MAX_FILES = 10; // Maximum number of files

    // Define common conversion format options
    // const formatOptions = [
    //     { value: 'pdf', label: 'PDF' },
    //     { value: 'docx', label: 'DOCX' },
    //     { value: 'jpg', label: 'JPG' },
    //     { value: 'png', label: 'PNG' },
    //     { value: 'mp3', label: 'MP3' },
    //     { value: 'mp4', label: 'MP4' },
    //     { value: 'zip', label: 'ZIP' },
    //     { value: 'txt', label: 'TXT' },
    //     { value: 'csv', label: 'CSV' },
    //     { value: 'json', label: 'JSON' },
    // ];

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
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            processFiles(selectedFiles);
        }
    }, []);

    const processFiles = (fileList: File[]) => {
        // Don't process if too many files
        if (files.length + fileList.length > MAX_FILES) {
            // Still add them but mark as failed
            const rejectedFiles: UploadedFile[] = fileList.map((file) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                status: 'failed',
                progress: 0,
                type: file.type,
                targetFormat: null,
                error: `Maximum ${MAX_FILES} files limit exceeded`,
            }));
            setFiles((prev) => [...prev, ...rejectedFiles]);
            return;
        }

        const currentTotalSize = files.reduce((sum, file) => sum + file.size, 0);
        const newFilesTotalSize = fileList.reduce((sum, file) => sum + file.size, 0);

        const newFiles: UploadedFile[] = fileList.map((file) => {
            // Check if file is too large
            if (file.size > MAX_FILE_SIZE) {
                return {
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: file.size,
                    status: 'failed' as const,
                    progress: 0,
                    type: file.type,
                    targetFormat: null,
                    error: `File exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`,
                };
            }

            // Check if total size would exceed limit
            if (currentTotalSize + newFilesTotalSize > MAX_TOTAL_SIZE) {
                return {
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: file.size,
                    status: 'failed' as const,
                    progress: 0,
                    type: file.type,
                    targetFormat: null,
                    error: `Total upload limit (${formatFileSize(MAX_TOTAL_SIZE)}) exceeded`,
                };
            }

            return {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                status: 'ready' as const,
                progress: 0,
                type: file.type,
                targetFormat: allTargetFormat,
            };
        });

        setFiles((prev) => [...prev, ...newFiles]);
    };

    const handleRemoveFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((file) => file.id !== id));
    }, []);

    const handleFormatChange = useCallback((id: string, format: string) => {
        setFiles((prev) =>
            prev.map((file) =>
                file.id === id ? { ...file, targetFormat: format } : file
            )
        );
    }, []);

    const handleFormatSelectorOpen = useCallback((fileId: string) => {
        setSelectedFileId(fileId);
        setShowFormatSelector(true);
    }, []);

    const handleFormatSelectorClose = useCallback(() => {
        setShowFormatSelector(false);
        setSelectedFileId(null);
    }, []);

    const handleAllFormatChange = useCallback((format: string) => {
        setAllTargetFormat(format);
        setFiles((prev) =>
            prev.map((file) => ({ ...file, targetFormat: format }))
        );
    }, []);

    const handleFormatSelect = useCallback((format: string) => {
        if (selectedFileId === 'all') {
            handleAllFormatChange(format);
        } else if (selectedFileId) {
            handleFormatChange(selectedFileId, format);
        }
        handleFormatSelectorClose();
    }, [selectedFileId, handleFormatChange, handleAllFormatChange, handleFormatSelectorClose]);

    const handleConvert = useCallback(() => {
        // Start uploading process
        setFiles((prev) =>
            prev.map((file) => ({ ...file, status: 'uploading' as const, progress: 0 }))
        );

        // Simulate upload progress
        let uploadProgress = 0;
        const uploadInterval = setInterval(() => {
            uploadProgress += 20;
            setFiles((prev) =>
                prev.map((file) => ({ ...file, progress: uploadProgress }))
            );

            if (uploadProgress >= 100) {
                clearInterval(uploadInterval);
                
                // Start converting process
                setFiles((prev) =>
                    prev.map((file) => ({ ...file, status: 'converting' as const, progress: 0 }))
                );

                // Simulate conversion progress
                let convertProgress = 0;
                const convertInterval = setInterval(() => {
                    convertProgress += 25;
                    setFiles((prev) =>
                        prev.map((file) => ({ ...file, progress: convertProgress }))
                    );

                    if (convertProgress >= 100) {
                        clearInterval(convertInterval);
                        
                        // Final conversion results
                        setFiles((prev) =>
                            prev.map((file, index) => {
                                // Simulate some files failing (30% chance)
                                const willFail = Math.random() < 0.3;
                                const errorMessages = [
                                    'Unsupported file format',
                                    'File corrupted',
                                    'Conversion timeout',
                                    'Invalid file structure'
                                ];

                                return {
                                    ...file,
                                    status: willFail ? 'failed' as const : 'finished' as const,
                                    progress: 100,
                                    error: willFail ? errorMessages[Math.floor(Math.random() * errorMessages.length)] : undefined
                                };
                            })
                        );
                    }
                }, 200);
            }
        }, 300);
    }, []);

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'tiff', 'bmp'].includes(ext || '')) {
            return (
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Image className="w-5 h-5 text-blue-600" />
                </div>
            );
        } else if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '')) {
            return (
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-red-600" />
                </div>
            );
        } else if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext || '')) {
            return (
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-orange-600" />
                </div>
            );
        } else {
            return (
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <File className="w-5 h-5 text-gray-600" />
                </div>
            );
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready':
                return 'text-gray-600';
            case 'uploading':
                return 'text-blue-600';
            case 'converting':
                return 'text-purple-600';
            case 'finished':
                return 'text-green-600';
            case 'failed':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ready':
                return 'Ready';
            case 'uploading':
                return 'Uploading';
            case 'converting':
                return 'Converting';
            case 'finished':
                return 'Finished';
            case 'failed':
                return 'Failed';
            default:
                return status;
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            {/* Upload Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`dashed-border transition-all ${isDragging
                        ? 'dragging bg-indigo-50'
                        : 'bg-white/50'
                    }`}
            >
                <label className="flex flex-col items-center justify-center py-20 cursor-pointer">
                    <div className="relative">
                        <UploadCloud className="w-14 h-14 text-indigo-600 mb-4" />
                    </div>
                    <p className="text-indigo-600 text-lg font-medium mb-2">
                        Click, or drop your files here
                    </p>
                    <div className="text-center text-sm text-gray-400 space-y-1">
                        <p>Maximum {MAX_FILES} files, {formatFileSize(MAX_FILE_SIZE)} per file</p>
                        <p>Total limit: {formatFileSize(MAX_TOTAL_SIZE)}</p>
                    </div>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
                        <div className="space-y-4">
                            {files.map((file) => {
                                const isLargeFile = file.size > MAX_FILE_SIZE * 0.7; // 70% of limit
                                const sizePercentage = (file.size / MAX_FILE_SIZE) * 100;
                                
                                return (
                                <div
                                    key={file.id}
                                    className={`rounded-2xl p-5 shadow-sm border transition-shadow ${
                                        file.status === 'failed' 
                                            ? 'bg-red-50 border-red-200' 
                                            : isLargeFile && file.status === 'ready'
                                                ? 'bg-yellow-50 border-yellow-200'
                                                : 'bg-white border-gray-100 hover:shadow-md'
                                    }`}
                                >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    {getFileIcon(file.name)}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>

                                {/* Format Selection */}
                                <div className="flex items-center gap-3 mr-10">
                                    <span className="text-sm text-gray-500 font-medium">to</span>
                                    <button
                                        onClick={() => handleFormatSelectorOpen(file.id)}
                                        className="bg-white border-2 border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2.5 cursor-pointer hover:border-indigo-300 transition-all duration-200 flex items-center gap-2 min-w-fit"
                                    >
                                        {file.targetFormat ? (
                                            <span className="font-medium">{file.targetFormat.toUpperCase()}</span>
                                        ) : (
                                            <span className="text-gray-500">Select</span>
                                        )}
                                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right min-w-[80px]">
                                        <p className="text-xs text-gray-500 mb-1">Status:</p>
                                        <p className={`font-semibold text-sm ${getStatusColor(file.status)}`}>
                                            {getStatusText(file.status)}
                                        </p>
                                    </div>

                                    <div className="w-32">
                                        {file.status === 'uploading' && (
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                                                    style={{ width: `${file.progress}%` }}
                                                />
                                            </div>
                                        )}
                                        {file.status === 'converting' && (
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-500 transition-all duration-300 rounded-full"
                                                    style={{ width: `${file.progress}%` }}
                                                />
                                            </div>
                                        )}
                                        {file.status === 'finished' && (
                                            <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" />
                                            </div>
                                        )}
                                        {file.status === 'ready' && (
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-gray-400 rounded-full" />
                                            </div>
                                        )}
                                        {file.status === 'failed' && (
                                            <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-red-500 rounded-full" />
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleRemoveFile(file.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                                        title="Remove file"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Size warning banner for large files */}
                            {isLargeFile && file.status === 'ready' && (
                                <div className="mt-3 p-2.5 bg-yellow-100 border border-yellow-200 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-yellow-800">
                                            <span className="font-medium">Large file:</span> This file is {sizePercentage.toFixed(0)}% of your {formatFileSize(MAX_FILE_SIZE)} limit
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Error Message for Failed Files */}
                            {file.status === 'failed' && file.error && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-red-700 font-medium">Conversion Failed</p>
                                        <p className="text-xs text-red-600 mt-1">{file.error}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                    })}

                    {/* Global Format Selection */}
                    {files.length > 1 && (
                        <div className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                            <span className="text-sm text-gray-700 font-medium">Convert all to</span>
                            <button
                                onClick={() => {
                                    setSelectedFileId('all');
                                    setShowFormatSelector(true);
                                }}
                                className="bg-white border-2 border-indigo-200 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2.5 cursor-pointer hover:border-indigo-300 transition-all duration-200 flex items-center gap-2 min-w-fit"
                            >
                                {allTargetFormat ? (
                                    <span className="font-medium">{allTargetFormat.toUpperCase()}</span>
                                ) : (
                                    <span className="text-gray-500">Select</span>
                                )}
                                <ChevronDown className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-6">
                        <div className="flex items-center gap-4">
                            {files.length > 0 && files.some((f) => f.status === 'finished') && (
                                <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Download All ({files.filter(f => f.status === 'finished').length})
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleConvert}
                            disabled={files.length === 0 || files.some(file => !file.targetFormat) || files.some(file => file.status === 'uploading' || file.status === 'converting')}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:shadow-none"
                        >
                            {files.some(file => file.status === 'uploading') ? 'Uploading...' : 
                             files.some(file => file.status === 'converting') ? 'Converting...' : 'Convert'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Format Selector Modal */}
            <FormatSelector
                value={selectedFileId === 'all' ? allTargetFormat : files.find(f => f.id === selectedFileId)?.targetFormat || null}
                onChange={handleFormatSelect}
                onClose={handleFormatSelectorClose}
                isOpen={showFormatSelector}
            />
        </div>
    );
}