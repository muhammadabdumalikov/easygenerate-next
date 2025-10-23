'use client';

import ConverterLayout from '@/components/converters/ConverterLayout';
import FileUpload from '@/components/FileUpload';
import { Grid } from 'react-feather';

export default function UniversalConverter() {
  return (
    <ConverterLayout
      title="Universal File Converter"
      description="Convert any file to any format. Upload multiple files, select your desired output format, and convert them all at once. Supports 300+ file formats including documents, images, videos, audio, and more."
      icon={<Grid className="w-8 h-8 text-white" />}
      badge="Popular"
    >
      {/* File Upload Component */}
      <FileUpload />

      {/* Features Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Batch Conversion
          </h3>
          <p className="text-sm text-gray-600">
            Upload and convert up to 10 files at once. Save time by processing multiple files simultaneously.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            300+ Formats
          </h3>
          <p className="text-sm text-gray-600">
            Support for all major file formats: PDF, DOCX, JPG, PNG, MP4, MP3, CSV, JSON, and many more.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Secure & Private
          </h3>
          <p className="text-sm text-gray-600">
            Your files are encrypted during transfer and automatically deleted after 24 hours for maximum security.
          </p>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="mt-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Supported File Types
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">📄</span> Documents
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• PDF, DOCX, DOC</li>
              <li>• TXT, RTF, ODT</li>
              <li>• PAGES, EPUB</li>
              <li>• XLS, XLSX, CSV</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-purple-600">🖼️</span> Images
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• JPG, PNG, GIF</li>
              <li>• SVG, WEBP, BMP</li>
              <li>• TIFF, ICO, PSD</li>
              <li>• HEIC, RAW</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-red-600">🎬</span> Video
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• MP4, AVI, MOV</li>
              <li>• MKV, WMV, FLV</li>
              <li>• WEBM, M4V</li>
              <li>• 3GP, VOB</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-orange-600">🎵</span> Audio
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• MP3, WAV, FLAC</li>
              <li>• AAC, OGG, WMA</li>
              <li>• M4A, AIFF</li>
              <li>• OPUS, AMR</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-indigo-200">
          <p className="text-center text-sm text-gray-600">
            <span className="font-semibold">And many more!</span> We support over 300 file formats across all categories.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          How It Works
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600">1</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Upload Files</h4>
            <p className="text-sm text-gray-600">
              Drag & drop or click to select up to 10 files
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Choose Format</h4>
            <p className="text-sm text-gray-600">
              Select output format for each file or all at once
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">3</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Convert</h4>
            <p className="text-sm text-gray-600">
              Click convert and watch the magic happen
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-600">4</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Download</h4>
            <p className="text-sm text-gray-600">
              Download your converted files instantly
            </p>
          </div>
        </div>
      </div>
    </ConverterLayout>
  );
}

