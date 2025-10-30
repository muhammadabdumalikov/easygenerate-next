'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ConverterLayout from '@/components/converters/ConverterLayout';
import { FileText, Download, Settings, CheckCircle, AlertCircle, Upload, Trash2 } from 'react-feather';

type ConversionStatus = 'idle' | 'processing' | 'success' | 'error';

interface ConversionOptions {
    flattenNested: boolean;
    separator: string;
    uppercaseKeys: boolean;
    includeComments: boolean;
}

interface ConvertedResult {
    fileName: string;
    lines: number;
    fileSize: number;
    content: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function JSONToENVContent() {
    const searchParams = useSearchParams();
    const modeFromUrl = searchParams.get('mode') as 'json-to-env' | 'env-to-json' | null;

    const [inputText, setInputText] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [conversionMode, setConversionMode] = useState<'json-to-env' | 'env-to-json'>(modeFromUrl || 'json-to-env');
    const [status, setStatus] = useState<ConversionStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [convertedData, setConvertedData] = useState<ConvertedResult | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showCopiedPopup, setShowCopiedPopup] = useState(false);
    const [options, setOptions] = useState<ConversionOptions>({
        flattenNested: true,
        separator: '_',
        uppercaseKeys: true,
        includeComments: true
    });

    // Update conversion mode when URL param changes
    useEffect(() => {
        if (modeFromUrl && (modeFromUrl === 'json-to-env' || modeFromUrl === 'env-to-json')) {
            setConversionMode(modeFromUrl);
            // Reset state when mode changes
            setInputText('');
            setUploadedFile(null);
            setConvertedData(null);
            setStatus('idle');
            setErrorMessage('');
        }
    }, [modeFromUrl]);

    const flattenObject = (obj: Record<string, unknown>, prefix = ''): Record<string, string> => {
        const result: Record<string, string> = {};

        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}${options.separator}${key}` : key;

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                if (options.flattenNested) {
                    Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
                } else {
                    result[newKey] = JSON.stringify(value);
                }
            } else if (Array.isArray(value)) {
                result[newKey] = JSON.stringify(value);
            } else {
                result[newKey] = String(value ?? '');
            }
        }

        return result;
    };

    const jsonToENV = (jsonText: string): string => {
        try {
            const jsonData = JSON.parse(jsonText);
            const flattened = flattenObject(jsonData);

            const lines: string[] = [];

            if (options.includeComments) {
                lines.push('# Generated from JSON');
                lines.push(`# Date: ${new Date().toISOString()}`);
                lines.push('');
            }

            for (const [key, value] of Object.entries(flattened)) {
                const envKey = options.uppercaseKeys ? key.toUpperCase() : key;
                // Quote values that contain spaces or special characters
                const envValue = value.includes(' ') || value.includes('#') ? `"${value}"` : value;
                lines.push(`${envKey}=${envValue}`);
            }

            return lines.join('\n');
        } catch (error) {
            throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const envToJSON = (envText: string): string => {
        try {
            const lines = envText.split('\n');
            const result: Record<string, unknown> = {};

            for (const line of lines) {
                const trimmed = line.trim();

                // Skip empty lines and comments
                if (!trimmed || trimmed.startsWith('#')) continue;

                // Parse KEY=VALUE format
                const equalIndex = trimmed.indexOf('=');
                if (equalIndex === -1) continue;

                const key = trimmed.substring(0, equalIndex).trim();
                let value = trimmed.substring(equalIndex + 1).trim();

                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                // Try to parse as JSON for arrays/objects
                try {
                    if (value.startsWith('[') || value.startsWith('{')) {
                        result[key] = JSON.parse(value);
                    } else {
                        result[key] = value;
                    }
                } catch {
                    result[key] = value;
                }
            }

            return JSON.stringify(result, null, 2);
        } catch (error) {
            throw new Error(`Invalid ENV format: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        const file = files[0];
        await processFile(file);
    };

    const processFile = async (file: File) => {
        // Validate file type
        const extension = file.name.split('.').pop()?.toLowerCase();
        const expectedExtension = conversionMode === 'json-to-env' ? 'json' : 'env';

        if (extension !== expectedExtension) {
            alert(`Please upload a .${expectedExtension} file`);
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            alert(`File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`);
            return;
        }

        setUploadedFile(file);
        setInputText('');
        setConvertedData(null);
        setStatus('idle');
        setErrorMessage('');
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        await processFile(file);
    };

    const removeUploadedFile = () => {
        setUploadedFile(null);
        setStatus('idle');
        setConvertedData(null);
        setErrorMessage('');
    };

    const handleConvert = async () => {
        const sourceContent = uploadedFile ? await uploadedFile.text() : inputText;

        if (!sourceContent.trim()) {
            alert(`Please provide ${conversionMode === 'json-to-env' ? 'JSON' : 'ENV'} data to convert`);
            return;
        }

        setStatus('processing');
        setProgress(0);
        setErrorMessage('');

        try {
            setProgress(30);

            let result: string;
            let fileName: string;

            if (conversionMode === 'json-to-env') {
                result = jsonToENV(sourceContent);
                fileName = uploadedFile ? uploadedFile.name.replace(/\.json$/i, '.env') : 'config.env';
            } else {
                result = envToJSON(sourceContent);
                fileName = uploadedFile ? uploadedFile.name.replace(/\.env$/i, '.json') : 'config.json';
            }

            setProgress(80);

            const lines = result.split('\n').length;
            const fileSize = new Blob([result]).size;

            setConvertedData({
                fileName,
                lines,
                fileSize,
                content: result
            });

            setProgress(100);
            setStatus('success');
        } catch (error) {
            console.error('Conversion error:', error);
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Conversion failed');
        }
    };

    const handleDownload = () => {
        if (!convertedData) return;

        try {
            const blob = new Blob([convertedData.content], {
                type: conversionMode === 'json-to-env' ? 'text/plain' : 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = convertedData.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed. Please try again.');
        }
    };

    const handleCopyToClipboard = () => {
        if (!convertedData) return;

        navigator.clipboard.writeText(convertedData.content)
            .then(() => {
                setShowCopiedPopup(true);
                setTimeout(() => setShowCopiedPopup(false), 2000);
            })
            .catch(() => alert('Failed to copy to clipboard'));
    };

    const clearAll = () => {
        setInputText('');
        setUploadedFile(null);
        setConvertedData(null);
        setStatus('idle');
        setProgress(0);
        setErrorMessage('');
    };

    const loadSampleData = () => {
        if (conversionMode === 'json-to-env') {
            setInputText(`{
  "APP_NAME": "MyApp",
  "APP_ENV": "production",
  "APP_DEBUG": false,
  "DATABASE": {
    "HOST": "localhost",
    "PORT": 5432,
    "NAME": "mydb"
  },
  "API": {
    "KEY": "abc123xyz",
    "TIMEOUT": 30
  }
}`);
        } else {
            setInputText(`# Application Configuration
APP_NAME=MyApp
APP_ENV=production
APP_DEBUG=false

# Database Settings
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=mydb

# API Settings
API_KEY=abc123xyz
API_TIMEOUT=30`);
        }
        setUploadedFile(null);
        setConvertedData(null);
        setStatus('idle');
    };

    return (
        <ConverterLayout
            title={conversionMode === 'json-to-env' ? 'JSON to ENV Converter' : 'ENV to JSON Converter'}
            description={conversionMode === 'json-to-env'
                ? 'Convert JSON configuration files to environment variable (.env) format.'
                : 'Convert environment variable (.env) files to JSON format.'}
        >
            <div className="max-w-7xl mx-auto">
                {/* Conversion Mode Toggle */}
                <div className="mb-8 flex justify-center">
                    <div className="inline-flex bg-white rounded-xl p-1.5 shadow-sm border border-gray-200">
                        <button
                            onClick={() => {
                                setConversionMode('json-to-env');
                                setInputText('');
                                setUploadedFile(null);
                                setConvertedData(null);
                                setStatus('idle');
                            }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${conversionMode === 'json-to-env'
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            JSON → ENV
                        </button>
                        <button
                            onClick={() => {
                                setConversionMode('env-to-json');
                                setInputText('');
                                setUploadedFile(null);
                                setConvertedData(null);
                                setStatus('idle');
                            }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${conversionMode === 'env-to-json'
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Settings className="w-5 h-5" />
                            ENV → JSON
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Convert Button (always visible; disabled when no input) */}
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={handleConvert}
                            disabled={!uploadedFile && !inputText.trim()}
                            aria-disabled={!uploadedFile && !inputText.trim()}
                            className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md ${
                                !uploadedFile && !inputText.trim()
                                    ? 'bg-gray-300 text-white cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-lg'
                            }`}
                        >
                            <FileText className="w-5 h-5" />
                            Convert to {conversionMode === 'json-to-env' ? 'ENV' : 'JSON'}
                        </button>
                        { (uploadedFile || inputText.trim()) && (
                            <button
                                onClick={clearAll}
                                className="text-gray-600 hover:text-gray-800 px-6 py-3 rounded-xl font-medium transition-colors border-2 border-gray-200 hover:border-gray-300"
                            >
                                Clear All
                            </button>
                        ) }
                    </div>

                    {/* Input and Output Area */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Input Section */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-900">Input</h3>
                            </div>
                            {/* Text Input Area */}
                            {!uploadedFile && (
                                <>
                                    <div className="space-y-2">
                                        <textarea
                                            value={inputText}
                                            onChange={(e) => {
                                                setInputText(e.target.value);
                                                if (e.target.value.trim()) {
                                                    setStatus('idle');
                                                    setConvertedData(null);
                                                }
                                            }}
                                            placeholder={conversionMode === 'json-to-env'
                                                ? 'Paste your JSON here...\n{\n  "API_KEY": "abc123",\n  "DATABASE_URL": "postgres://..."\n}'
                                                : 'Paste your ENV content here...\nAPI_KEY=abc123\nDATABASE_URL=postgres://...'
                                            }
                                            className="w-full h-96 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm font-mono resize-none"
                                        />
                                        {inputText && (
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>{inputText.split('\n').length} lines</span>
                                                <span>{new Blob([inputText]).size} B</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-white text-gray-500 font-medium">
                                                Or upload your {conversionMode === 'json-to-env' ? 'JSON' : 'ENV'} file:
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* File Upload / Drag & Drop */}
                            {!uploadedFile && (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                >
                                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p className="text-sm text-gray-600 mb-2">
                                        Drag & drop your {conversionMode === 'json-to-env' ? 'JSON' : 'ENV'} file here
                                    </p>
                                    <p className="text-xs text-gray-400 mb-4">or</p>
                                    <label className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Choose File
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            accept={conversionMode === 'json-to-env' ? '.json' : '.env'}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-xs text-gray-400 mt-3">
                                        Max file size: {formatFileSize(MAX_FILE_SIZE)}
                                    </p>
                                </div>
                            )}

                            {/* File Uploaded Card */}
                            {uploadedFile && (
                                <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {formatFileSize(uploadedFile.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={removeUploadedFile}
                                            className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                                            title="Remove file"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}


                            <button
                                onClick={loadSampleData}
                                className="w-full mt-3 text-purple-600 hover:text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm border border-purple-200 hover:border-purple-300"
                            >
                                Load Sample Data
                            </button>
                        </div>

                        {/* Output Section */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-green-600" />
                                <h3 className="font-semibold text-gray-900">Output</h3>
                            </div>

                            {status === 'idle' && !convertedData && (
                                <div className="text-center py-12 text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Your converted {conversionMode === 'json-to-env' ? 'ENV' : 'JSON'} will appear here</p>
                                </div>
                            )}

                            {status === 'processing' && (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
                                    <p className="text-sm text-gray-600">Converting...</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                                        <div
                                            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-red-900">Conversion Failed</p>
                                            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {status === 'success' && convertedData && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="font-semibold text-green-900">Conversion Complete!</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-600">Lines:</span>
                                                <span className="ml-2 font-semibold text-gray-900">{convertedData.lines}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Size:</span>
                                                <span className="ml-2 font-semibold text-gray-900">{formatFileSize(convertedData.fileSize)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Preview:</h4>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-[65vh] overflow-auto">
                                            <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-words">
                                                {convertedData.content}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDownload}
                                            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                        <button
                                            onClick={handleCopyToClipboard}
                                            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-semibold transition-all border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Settings Panel */}
                    {conversionMode === 'json-to-env' && (
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Settings className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-900">Settings</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={options.flattenNested}
                                            onChange={(e) => setOptions({ ...options, flattenNested: e.target.checked })}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700">Flatten Nested Objects</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Separator
                                    </label>
                                    <select
                                        value={options.separator}
                                        onChange={(e) => setOptions({ ...options, separator: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                                    >
                                        <option value="_">Underscore (_)</option>
                                        <option value=".">Dot (.)</option>
                                        <option value="-">Dash (-)</option>
                                        <option value="__">Double Underscore (__)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={options.uppercaseKeys}
                                            onChange={(e) => setOptions({ ...options, uppercaseKeys: e.target.checked })}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700">Uppercase Keys</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={options.includeComments}
                                            onChange={(e) => setOptions({ ...options, includeComments: e.target.checked })}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700">Include Comments</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Copied Popup Notification */}
            {showCopiedPopup && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in">
                    <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Copied to clipboard!</span>
                    </div>
                </div>
            )}
        </ConverterLayout>
    );
}

export default function JSONToENV() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <JSONToENVContent />
        </Suspense>
    );
}

