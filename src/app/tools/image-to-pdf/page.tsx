'use client';

import { useState } from 'react';
import { Image as ImageIcon, FileText } from 'react-feather';
import ConverterLayout from '@/components/converters/ConverterLayout';
import DragDropZone, { UploadedFile } from '@/components/converters/DragDropZone';
import OptionsPanel, { OptionConfig } from '@/components/converters/OptionsPanel';
import ResultPreview, { ConversionStatus } from '@/components/converters/ResultPreview';

interface ConvertedResult {
  fileName: string;
  fileSize: number;
  pageCount: number;
  settings: Record<string, string | number | boolean>;
}

export default function ImageToPDFConverter() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [convertedData, setConvertedData] = useState<ConvertedResult | null>(null);
  const [options, setOptions] = useState({
    pageSize: 'a4',
    orientation: 'portrait',
    quality: 90,
    margin: 10,
    fitToPage: true,
    mergeAll: true
  });

  const optionConfigs: OptionConfig[] = [
    {
      id: 'pageSize',
      label: 'Page Size',
      type: 'select',
      value: options.pageSize,
      options: [
        { value: 'a4', label: 'A4', icon: '📄' },
        { value: 'letter', label: 'Letter', icon: '📃' },
        { value: 'legal', label: 'Legal', icon: '📋' },
        { value: 'tabloid', label: 'Tabloid', icon: '📰' }
      ],
      description: 'Select the PDF page size'
    },
    {
      id: 'orientation',
      label: 'Orientation',
      type: 'select',
      value: options.orientation,
      options: [
        { value: 'portrait', label: 'Portrait', icon: '📱' },
        { value: 'landscape', label: 'Landscape', icon: '🖥️' }
      ],
      description: 'Page orientation'
    },
    {
      id: 'quality',
      label: 'Image Quality',
      type: 'slider',
      value: options.quality,
      min: 50,
      max: 100,
      step: 5,
      description: 'Higher quality = larger file size'
    },
    {
      id: 'margin',
      label: 'Page Margin (mm)',
      type: 'slider',
      value: options.margin,
      min: 0,
      max: 50,
      step: 5,
      description: 'Space around the image'
    },
    {
      id: 'fitToPage',
      label: 'Fit to Page',
      type: 'toggle',
      value: options.fitToPage,
      description: 'Automatically resize images to fit page'
    },
    {
      id: 'mergeAll',
      label: 'Merge into Single PDF',
      type: 'toggle',
      value: options.mergeAll,
      description: 'Combine all images into one PDF file'
    }
  ];

  const handleFilesAdded = (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    setStatus('idle');
  };

  const handleFileRemove = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    if (uploadedFiles.length <= 1) {
      setStatus('idle');
      setConvertedData(null);
    }
  };

  const handleOptionChange = (id: string, value: string | number | boolean) => {
    setOptions(prev => ({ ...prev, [id]: value }));
  };

  const handleConvert = async () => {
    if (uploadedFiles.length === 0) return;

    setStatus('processing');
    setProgress(0);

    // Simulate conversion process
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      // Mock result
      const result = {
        fileName: options.mergeAll 
          ? 'merged-images.pdf' 
          : `${uploadedFiles[0].name.split('.')[0]}.pdf`,
        fileSize: uploadedFiles.reduce((acc, f) => acc + f.size, 0) * 0.8,
        pageCount: options.mergeAll ? uploadedFiles.length : 1,
        settings: options
      };
      
      setConvertedData(result);
      setStatus('success');
    }, 2000);
  };

  const handleDownload = () => {
    if (!convertedData) return;
    // In a real implementation, this would download the actual PDF
    alert(`Downloading ${convertedData.fileName}...`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <ConverterLayout
      title="Image to PDF Converter"
      description="Convert your images (JPG, PNG, GIF, etc.) to high-quality PDF documents. Merge multiple images into a single PDF or create individual files."
      icon={<FileText className="w-8 h-8 text-white" />}
      badge="Free"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload & Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Zone */}
          <DragDropZone
            uploadedFiles={uploadedFiles}
            onFilesAdded={handleFilesAdded}
            onFileRemove={handleFileRemove}
            acceptedFileTypes="image/*"
            maxFileSize={10 * 1024 * 1024}
            maxFiles={20}
            allowMultiple={true}
            showPreview={true}
            icon={<ImageIcon className="w-14 h-14 text-indigo-600" />}
            title="Drop your images here"
            subtitle="or click to browse"
          />

          {/* Convert Button */}
          {uploadedFiles.length > 0 && status !== 'processing' && (
            <button
              onClick={handleConvert}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
            >
              <FileText className="w-6 h-6" />
              Convert to PDF
            </button>
          )}

          {/* Result Preview */}
          <ResultPreview
            status={status}
            result={convertedData}
            progress={progress}
            onDownload={handleDownload}
            renderPreview={(result) => {
              const data = result as ConvertedResult;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">File Name</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {data.fileName}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">File Size</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatFileSize(data.fileSize)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Pages</p>
                      <p className="text-sm font-medium text-gray-900">
                        {data.pageCount} {data.pageCount === 1 ? 'page' : 'pages'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Page Size</p>
                      <p className="text-sm font-medium text-gray-900 uppercase">
                        {data.settings.pageSize}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                    <p className="text-xs text-indigo-700 font-medium mb-2">Settings Applied:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-indigo-600">
                      <span>• Quality: {data.settings.quality}%</span>
                      <span>• Margin: {data.settings.margin}mm</span>
                      <span>• Orientation: {data.settings.orientation}</span>
                      <span>• {data.settings.fitToPage ? '✓ Fit to page' : '✗ Original size'}</span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>

        {/* Right Column: Options Panel */}
        <div className="lg:col-span-1">
          <OptionsPanel
            title="PDF Settings"
            options={optionConfigs}
            onChange={handleOptionChange}
            className="sticky top-24"
          />
        </div>
      </div>

      {/* Features Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <ImageIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">All Image Formats</h3>
          <p className="text-sm text-gray-600">
            Supports JPG, PNG, GIF, BMP, TIFF, WebP, and more
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">High Quality</h3>
          <p className="text-sm text-gray-600">
            Preserve image quality with adjustable compression settings
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Fast Processing</h3>
          <p className="text-sm text-gray-600">
            Convert multiple images to PDF in seconds
          </p>
        </div>
      </div>
    </ConverterLayout>
  );
}

