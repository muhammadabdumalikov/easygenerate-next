'use client';

import { useState } from 'react';
import { FileText, Upload, Download, RefreshCw, Trash2, AlertCircle, CheckCircle } from 'react-feather';
import ConverterLayout from '@/components/converters/ConverterLayout';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';

type ConversionStatus = 'idle' | 'processing' | 'success' | 'error';

interface ConvertedResult {
  fileName: string;
  fileSize: number;
  pages: number;
  buffer: ArrayBuffer;
}

interface ConversionOptions {
  pageSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  fontSize: number;
  margins: number;
}

export default function WordToPDF() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [convertedData, setConvertedData] = useState<ConvertedResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [options, setOptions] = useState<ConversionOptions>({
    pageSize: 'a4',
    orientation: 'portrait',
    fontSize: 12,
    margins: 20
  });

  const wordToPDF = async (file: File): Promise<{ pdf: jsPDF; pages: number }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Extract text from Word document
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      if (!text || text.trim().length === 0) {
        throw new Error('Document appears to be empty');
      }

      // Create PDF
      const pdf = new jsPDF({
        orientation: options.orientation,
        unit: 'mm',
        format: options.pageSize
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = options.margins;
      const lineHeight = options.fontSize * 0.35; // Convert font size to mm
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - (margin * 2);

      pdf.setFontSize(options.fontSize);
      
      // Split text into paragraphs
      const paragraphs = text.split(/\n+/);
      let y = margin;
      let currentPage = 1;

      for (const paragraph of paragraphs) {
        if (!paragraph.trim()) continue;

        // Split paragraph into lines that fit the page width
        const lines = pdf.splitTextToSize(paragraph, maxWidth);
        
        for (const line of lines) {
          // Check if we need a new page
          if (y + lineHeight > pageHeight - margin) {
            pdf.addPage();
            currentPage++;
            y = margin;
          }
          
          pdf.text(line, margin, y);
          y += lineHeight;
        }
        
        // Add spacing between paragraphs
        y += lineHeight * 0.5;
      }

      return {
        pdf,
        pages: currentPage
      };
    } catch (error) {
      console.error('Word to PDF conversion error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unable to convert Word document to PDF');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.docx') && !fileName.endsWith('.doc')) {
      alert('Please select a valid Word document (.docx or .doc)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large! Maximum size is 10 MB');
      return;
    }

    setUploadedFile(file);
    setStatus('idle');
    setConvertedData(null);
    setErrorMessage('');
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setStatus('idle');
    setConvertedData(null);
    setErrorMessage('');
  };

  const handleConvert = async () => {
    if (!uploadedFile) {
      alert('Please upload a Word document first');
      return;
    }

    setStatus('processing');
    setProgress(0);
    setErrorMessage('');

    try {
      setProgress(30);
      const { pdf, pages } = await wordToPDF(uploadedFile);
      
      setProgress(80);
      
      const pdfBuffer = pdf.output('arraybuffer');
      
      const result: ConvertedResult = {
        fileName: `${uploadedFile.name.replace(/\.[^/.]+$/, '')}.pdf`,
        fileSize: pdfBuffer.byteLength,
        pages,
        buffer: pdfBuffer
      };

      setConvertedData(result);
      setProgress(100);
      setStatus('success');
    } catch (error) {
      console.error('Conversion error:', error);
      setStatus('error');
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrorMessage(message);
    }
  };

  const handleDownload = () => {
    if (!convertedData?.buffer) return;

    try {
      const blob = new Blob([convertedData.buffer], { type: 'application/pdf' });
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

  const clearAll = () => {
    setUploadedFile(null);
    setStatus('idle');
    setConvertedData(null);
    setProgress(0);
    setErrorMessage('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <ConverterLayout
      title="Word to PDF Converter"
      description="Convert Word documents to PDF format. Preserve your document layout in a portable format."
      icon={<FileText className="w-8 h-8 text-white" />}
      badge="Free"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input & Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Area */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-t-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Word Input</h3>
                </div>
                <button
                  onClick={clearAll}
                  className="px-3 py-1.5 text-sm bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>

              {/* File Upload */}
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center h-[400px] flex items-center justify-center">
                  <input
                    type="file"
                    accept=".docx,.doc"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium text-lg">Click to upload Word document</p>
                    <p className="text-gray-500 text-base">or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-2">Max size: 10 MB</p>
                  </label>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="w-full max-w-2xl">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-8">
                        {/* Success Badge */}
                        <div className="flex items-center justify-center mb-6">
                          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-700">Ready to Convert</span>
                          </div>
                        </div>

                        {/* File Display */}
                        <div className="flex items-center gap-6 mb-8">
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center">
                              <FileText className="text-blue-600 w-12 h-12" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 truncate" title={uploadedFile.name}>
                              {uploadedFile.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="font-medium">{formatFileSize(uploadedFile.size)}</span>
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span className="font-medium">{uploadedFile.name.split('.').pop()?.toUpperCase()} File</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              accept=".docx,.doc"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <div className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow">
                              <Upload className="w-4 h-4" />
                              Choose Different File
                            </div>
                          </label>
                          <button
                            onClick={removeUploadedFile}
                            className="px-3 py-2.5 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 rounded-lg transition-all flex items-center justify-center"
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Output/Preview Area */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-t-xl">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">PDF Preview</h3>
              </div>
            </div>

            <div className="p-5 min-h-[300px]">
              {status === 'idle' && !convertedData && (
                <div className="flex items-center justify-center h-full py-12 text-gray-400">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p>Upload a Word document to start conversion</p>
                  </div>
                </div>
              )}

              {status === 'processing' && (
                <div className="flex items-center justify-center h-full py-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-gray-900 font-semibold mb-2">Converting to PDF...</p>
                    <div className="w-64 bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-gray-500 text-sm">{progress}%</p>
                  </div>
                </div>
              )}

              {status === 'success' && convertedData && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-800">Conversion Successful!</p>
                      <p className="text-xs text-green-600 mt-1">
                        {convertedData.pages} page{convertedData.pages !== 1 ? 's' : ''} • {formatFileSize(convertedData.fileSize)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF ({formatFileSize(convertedData.fileSize)})
                  </button>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center justify-center h-full p-6">
                  <div className="max-w-lg w-full">
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-red-900 mb-2">Conversion Failed</h3>
                          <p className="text-sm text-red-800 mb-4 leading-relaxed">
                            {errorMessage || 'An error occurred during conversion. Please try again.'}
                          </p>
                          <button
                            onClick={() => {
                              setStatus('idle');
                              setErrorMessage('');
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-24">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-200">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Settings</h3>
              </div>

              <div className="space-y-5">
                {/* Page Size */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-800">Page Size</label>
                  <select
                    value={options.pageSize}
                    onChange={(e) => setOptions({...options, pageSize: e.target.value as any})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="legal">Legal</option>
                  </select>
                </div>

                {/* Orientation */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-800">Orientation</label>
                  <select
                    value={options.orientation}
                    onChange={(e) => setOptions({...options, orientation: e.target.value as any})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-800">Font Size</label>
                  <input
                    type="number"
                    value={options.fontSize}
                    onChange={(e) => setOptions({...options, fontSize: parseInt(e.target.value) || 12})}
                    min="8"
                    max="18"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Margins */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-800">Margins (mm)</label>
                  <input
                    type="number"
                    value={options.margins}
                    onChange={(e) => setOptions({...options, margins: parseInt(e.target.value) || 20})}
                    min="10"
                    max="50"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Convert Button */}
              {uploadedFile && status !== 'processing' && (
                <button
                  onClick={handleConvert}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Convert to PDF
                </button>
              )}

              {/* Unicode Warning */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 font-semibold mb-1">⚠️ Unicode Support Limited</p>
                <p className="text-xs text-yellow-700 leading-relaxed">
                  Cyrillic, Chinese, Arabic and other non-Latin characters may not display correctly in PDF due to font limitations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConverterLayout>
  );
}

