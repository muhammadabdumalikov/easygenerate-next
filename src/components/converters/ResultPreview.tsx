'use client';

import { useState } from 'react';
import { Download, Eye, Copy, Check, AlertCircle, Loader } from 'react-feather';

export type ConversionStatus = 'idle' | 'processing' | 'success' | 'error';

interface ResultPreviewProps {
  status: ConversionStatus;
  result?: unknown;
  error?: string;
  progress?: number;
  onDownload?: () => void;
  renderPreview?: (result: unknown) => React.ReactNode;
  downloadFileName?: string;
  showCopyButton?: boolean;
  onCopy?: () => void;
}

export default function ResultPreview({
  status,
  result,
  error,
  progress = 0,
  onDownload,
  renderPreview,
  downloadFileName = 'converted-file',
  showCopyButton = false,
  onCopy
}: ResultPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Idle state
  if (status === 'idle') {
    return (
      <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-200">
        <div className="text-center py-8">
          <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            Your converted result will appear here
          </p>
        </div>
      </div>
    );
  }

  // Processing state
  if (status === 'processing') {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <div className="text-center py-8">
          <div className="relative inline-block mb-4">
            <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
          <p className="text-gray-900 font-medium mb-2">Processing...</p>
          <p className="text-sm text-gray-500 mb-4">
            This may take a few moments
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-xs mx-auto">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{progress}%</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
        <div className="text-center py-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-900 font-medium mb-2">Conversion Failed</p>
          <p className="text-sm text-red-600">
            {error || 'An error occurred during conversion'}
          </p>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Conversion Complete</p>
              <p className="text-xs text-gray-600">Ready to download</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showCopyButton && (
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-indigo-300 transition-all text-sm font-medium flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            )}
            
            {onDownload && (
              <button
                onClick={onDownload}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-6">
        {renderPreview ? (
          renderPreview(result)
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p className="text-sm">Preview not available</p>
          </div>
        )}
      </div>
    </div>
  );
}

