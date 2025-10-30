'use client';

import { useState } from 'react';
import Script from 'next/script';
import { FileText, Upload, Download, AlertCircle, CheckCircle, Table, Trash2 } from 'react-feather';
import ConverterLayout from '@/components/converters/ConverterLayout';
import ExcelJS from 'exceljs';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake with fonts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(pdfMake as any).vfs = pdfFonts;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
  includeGridlines: boolean;
  worksheetName?: string;
}

export default function ExcelToPDF() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [convertedData, setConvertedData] = useState<ConvertedResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    pageSize: 'a4',
    orientation: 'landscape',
    fontSize: 10,
    includeGridlines: true,
    worksheetName: ''
  });

  const excelToPDF = async (file: File): Promise<{ buffer: ArrayBuffer; pages: number }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      if (!workbook.worksheets || workbook.worksheets.length === 0) {
        throw new Error('No worksheets found in Excel file');
      }

      const worksheet = options.worksheetName && options.worksheetName.trim()
        ? workbook.getWorksheet(options.worksheetName.trim())
        : workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('Could not access worksheet');
      }

      // Extract data with proper encoding handling
      const data: string[][] = [];

      worksheet.eachRow((row) => {
        const rowData: string[] = [];

        row.eachCell({ includeEmpty: true }, (cell) => {
          const value = cell.value;
          let cellValue = '';

          if (value === null || value === undefined) {
            cellValue = '';
          } else if (typeof value === 'object' && 'text' in value) {
            // Handle rich text with proper encoding
            cellValue = value.text || '';
          } else if (typeof value === 'object' && 'result' in value) {
            cellValue = String(value.result ?? '');
          } else {
            cellValue = String(value);
          }

          // Keep original text including Cyrillic characters
          cellValue = cellValue.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          rowData.push(cellValue);
        });

        data.push(rowData);
      });

      if (data.length === 0) {
        throw new Error('Worksheet is empty');
      }

      const title = worksheet.name || 'Sheet1';

      // Create pdfMake document definition
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docDefinition: any = {
        pageSize: options.pageSize.toUpperCase(),
        pageOrientation: options.orientation,
        content: [
          {
            text: title,
            style: 'header',
            margin: [0, 0, 0, 10]
          },
          {
            table: {
              headerRows: 1,
              widths: Array(data[0].length).fill('auto'),
              body: data
            },
            layout: {
              fillColor: function (rowIndex: number) {
                if (rowIndex === 0) return '#428bca';
                return (rowIndex % 2 === 0) ? '#f5f5f5' : null;
              },
              hLineWidth: function () {
                return options.includeGridlines ? 0.5 : 0;
              },
              vLineWidth: function () {
                return options.includeGridlines ? 0.5 : 0;
              },
              hLineColor: function () {
                return '#dddddd';
              },
              vLineColor: function () {
                return '#dddddd';
              },
              paddingLeft: function () { return 5; },
              paddingRight: function () { return 5; },
              paddingTop: function () { return 3; },
              paddingBottom: function () { return 3; }
            }
          }
        ],
        styles: {
          header: {
            fontSize: 14,
            bold: true
          }
        },
        defaultStyle: {
          fontSize: options.fontSize
        }
      };

      // Generate PDF
      return new Promise((resolve) => {
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);

        pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
          // Estimate pages (pdfMake doesn't provide exact page count easily)
          const estimatedPages = Math.ceil(data.length / 30);

          // Convert Buffer to ArrayBuffer
          const arrayBuffer = buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength
          ) as ArrayBuffer;

          resolve({
            buffer: arrayBuffer,
            pages: estimatedPages
          });
        });
      });
    } catch (error) {
      console.error('Excel to PDF conversion error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unable to convert Excel file to PDF');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      alert('Please select a valid Excel file (.xlsx or .xls)');
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
      alert('Please upload an Excel file first');
      return;
    }

    setStatus('processing');
    setProgress(0);
    setErrorMessage('');

    try {
      setProgress(30);
      const { buffer, pages } = await excelToPDF(uploadedFile);

      setProgress(80);

      const result: ConvertedResult = {
        fileName: `${uploadedFile.name.replace(/\.[^/.]+$/, '')}.pdf`,
        fileSize: buffer.byteLength,
        pages,
        buffer
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      alert(`File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`);
      return;
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setUploadedFile(file);
    setStatus('idle');
    setConvertedData(null);
    setErrorMessage('');
  };

  return (
    <>
    <Script id="ld-excel-to-pdf" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Excel to PDF Converter",
        applicationCategory: "UtilityApplication",
        operatingSystem: "Web",
        url: "https://converto.dev/tools/excel-to-pdf",
        offers: {
          "@type": "Offer",
          price: 0,
          priceCurrency: "USD"
        }
      })}
    </Script>
    <ConverterLayout
      title="Excel to PDF Converter"
      description="Convert Excel spreadsheets to PDF documents. Preserve your data in a portable format."
      icon={<Table className="w-8 h-8 text-white" />}
      badge="Free"
    >
      <div className="max-w-7xl mx-auto space-y-6 mb-6">
        {/* Top Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleConvert}
            disabled={!uploadedFile || status === 'processing'}
            aria-disabled={!uploadedFile || status === 'processing'}
            className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md mb-2 sm:mb-0 ${!uploadedFile || status === 'processing'
                ? 'bg-gray-300 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-lg'
              }`}
          >
            <FileText className="w-5 h-5" />
            Convert to PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Input & Output */}
        <div className="space-y-6">
          {/* Input & Output Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Area */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Table className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Excel Input</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearAll}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="mb-4 min-h-[400px]">
                {!uploadedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg text-center transition-colors p-12 h-[400px] flex items-center justify-center ${isDragging
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-400'
                      }`}
                  >
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className={`w-16 h-16 ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <p className={`font-medium text-lg ${isDragging ? 'text-indigo-600' : 'text-gray-600'}`}>
                        {isDragging ? 'Drop your Excel file here' : 'Click to upload Excel file'}
                      </p>
                      <p className="text-gray-500 text-base">or drag and drop</p>
                      <p className="text-xs text-gray-400">Max size: {formatFileSize(MAX_FILE_SIZE)}</p>
                    </label>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="w-full max-w-2xl">
                      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-8">
                          {/* Success Badge */}
                          <div className="flex items-center justify-center mb-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-700">Ready to Convert</span>
                            </div>
                          </div>

                          {/* File Display */}
                          <div className="flex items-center gap-6 mb-8">
                            <div className="flex-shrink-0">
                              <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center">
                                <Table className="text-green-600 w-12 h-12" />
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
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <div className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow">
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

            {/* Right: Output Area */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">PDF Output</h3>
                </div>
              </div>

              <div className="min-h-[400px]">
                {status === 'idle' && !convertedData && (
                  <div className="flex items-center justify-center h-full py-12 text-gray-400">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                      <p>Upload an Excel file to start conversion</p>
                    </div>
                  </div>
                )}

                {status === 'processing' && (
                  <div className="flex items-center justify-center h-full py-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <FileText className="w-8 h-8 text-indigo-600" />
                      </div>
                      <p className="text-gray-900 font-semibold mb-2">Converting to PDF...</p>
                      <div className="w-64 bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
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
        </div>

        {/* Settings & Actions (moved to bottom) */}
        <div className="space-y-6">
          <div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-200">
                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Table className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Settings</h3>
              </div>

              <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
                {/* Page Size */}
                <div className="space-y-2 md:w-[calc(50%-0.5rem)]">
                  <label className="text-sm font-semibold text-gray-800">Page Size</label>
                  <select
                    value={options.pageSize}
                    onChange={(e) => setOptions({ ...options, pageSize: e.target.value as 'a4' | 'letter' | 'legal' })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                  >
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="legal">Legal</option>
                  </select>
                </div>

                {/* Orientation */}
                <div className="space-y-2 md:w-[calc(50%-0.5rem)]">
                  <label className="text-sm font-semibold text-gray-800">Orientation</label>
                  <select
                    value={options.orientation}
                    onChange={(e) => setOptions({ ...options, orientation: e.target.value as 'portrait' | 'landscape' })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                {/* Worksheet Name */}
                <div className="space-y-2 md:w-[calc(50%-0.5rem)]">
                  <label className="text-sm font-semibold text-gray-800">Worksheet name (optional)</label>
                  <input
                    type="text"
                    value={options.worksheetName ?? ''}
                    onChange={(e) => setOptions({ ...options, worksheetName: e.target.value })}
                    placeholder="e.g., Sheet1"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                  />
                </div>

                {/* Font Size */}
                <div className="space-y-2 md:w-[calc(50%-0.5rem)]">
                  <label className="text-sm font-semibold text-gray-800">Font Size</label>
                  <input
                    type="number"
                    value={options.fontSize}
                    onChange={(e) => setOptions({ ...options, fontSize: parseInt(e.target.value) || 10 })}
                    min="6"
                    max="16"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                  />
                </div>

                {/* Gridlines */}
                <div className="flex items-center justify-between md:w-[calc(50%-0.5rem)]">
                  <label className="text-sm font-semibold text-gray-800">Include gridlines</label>
                  <button
                    onClick={() => setOptions({ ...options, includeGridlines: !options.includeGridlines })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${options.includeGridlines ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${options.includeGridlines ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>

              {/* Convert Button */}
              {uploadedFile && status !== 'processing' && (
                <button
                  onClick={handleConvert}
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Convert to PDF
                </button>
              )}

              {/* Cyrillic Support Info */}
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800 font-semibold mb-1">✅ Full Unicode Support</p>
                <p className="text-xs text-green-700 leading-relaxed">
                  Now using pdfMake with full Cyrillic and Unicode support. All characters including Russian, Ukrainian, and other Cyrillic scripts display correctly in the PDF.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConverterLayout>
    </>
  );
}

