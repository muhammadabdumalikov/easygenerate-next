'use client';

import { useState, useEffect, Suspense } from 'react';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import ConverterLayout from '@/components/converters/ConverterLayout';
import { FileText, Download, Table, CheckCircle, AlertCircle, AlertTriangle, Upload, X } from 'react-feather';
import ExcelJS from 'exceljs';

type ConversionStatus = 'idle' | 'processing' | 'success' | 'error';

interface ConversionOptions {
  delimiter: string;
  hasHeaders: boolean;
  sheetName: string;
  autoWidth: boolean;
  freezeHeader: boolean;
}

interface ConvertedResult {
  fileName: string;
  rows: number;
  columns: number;
  fileSize: number;
  preview: string[][];
  buffer?: ArrayBuffer;
}

function CSVToExcelContent() {
  const searchParams = useSearchParams();
  const modeFromUrl = searchParams.get('mode') as 'csv-to-excel' | 'excel-to-csv' | null;
  
  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [conversionMode, setConversionMode] = useState<'csv-to-excel' | 'excel-to-csv'>(modeFromUrl || 'csv-to-excel');
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [convertedData, setConvertedData] = useState<ConvertedResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [options, setOptions] = useState<ConversionOptions>({
    delimiter: 'comma',
    hasHeaders: true,
    sheetName: 'Sheet1',
    autoWidth: true,
    freezeHeader: true
  });

  // Update conversion mode when URL param changes
  useEffect(() => {
    if (modeFromUrl && (modeFromUrl === 'csv-to-excel' || modeFromUrl === 'excel-to-csv')) {
      setConversionMode(modeFromUrl);
    }
  }, [modeFromUrl]);

  // File size limits
  const MAX_INPUT_SIZE = 5 * 1024 * 1024; // 5MB input limit
  const MAX_ROWS = 10000; // 10k rows limit
  const MAX_COLUMNS = 100; // 100 columns limit

  const getDelimiter = (type: string): string => {
    const delimiters: Record<string, string> = {
      comma: ',',
      semicolon: ';',
      tab: '\t',
      pipe: '|'
    };
    return delimiters[type] || ',';
  };

  const parseCSV = (text: string, delimiter: string): string[][] => {
    const lines = text.trim().split('\n');
    return lines.map(line => {
      // Simple CSV parsing (doesn't handle quoted fields with commas)
      return line.split(delimiter).map(cell => cell.trim());
    });
  };

  const excelToCSV = async (file: File): Promise<{ csv: string; rows: number; columns: number }> => {
    const delimiter = getDelimiter(options.delimiter);
    
    try {
      // Read Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      

      
      // Check if workbook has any worksheets at all
      if (!workbook.worksheets || workbook.worksheets.length === 0) {
        throw new Error('Unable to read worksheets from this Excel file. If this is an older .xls file (Excel 97-2003), please save it as .xlsx format first. You can do this in Excel by clicking File → Save As → Excel Workbook (.xlsx)');
      }
      
      // Get first visible worksheet (skip hidden ones)
      let worksheet = null;
      for (const ws of workbook.worksheets) {
        if (ws && ws.state !== 'hidden' && ws.state !== 'veryHidden') {
          worksheet = ws;
          console.log('Selected worksheet:', ws.name, 'State:', ws.state);
          break;
        }
      }
      
      // If no visible worksheet found, try the first one anyway
      if (!worksheet) {
        worksheet = workbook.getWorksheet(1);
        console.log('No visible worksheet found, using getWorksheet(1)');
      }
      
      if (!worksheet) {
        throw new Error('Unable to access any worksheet in the Excel file. The file may be password-protected or corrupted.');
      }
    
      const rows: string[][] = [];
      let maxColumns = 0;
      
      // Extract all rows
      worksheet.eachRow((row, rowNumber) => {
        console.log(`Processing row ${rowNumber}, cells:`, row.cellCount);
        const rowData: string[] = [];
        row.eachCell({ includeEmpty: true }, (cell) => {
          const value = cell.value;
          let cellValue = '';
          
          if (value === null || value === undefined) {
            cellValue = '';
          } else if (typeof value === 'object' && 'text' in value) {
            // Rich text
            cellValue = value.text;
          } else if (typeof value === 'object' && 'result' in value) {
            // Formula
            cellValue = String(value.result ?? '');
          } else {
            cellValue = String(value);
          }
          
          // Escape values that contain delimiter or quotes
          if (cellValue.includes(delimiter) || cellValue.includes('"') || cellValue.includes('\n')) {
            cellValue = `"${cellValue.replace(/"/g, '""')}"`;
          }
          
          rowData.push(cellValue);
        });
        
        rows.push(rowData);
        maxColumns = Math.max(maxColumns, rowData.length);
      });

      
      // Check if we actually got any data
      if (rows.length === 0) {
        throw new Error('The Excel worksheet appears to be empty. Please make sure the file contains data.');
      }
      
      // Convert to CSV string
      const csv = rows.map(row => row.join(delimiter)).join('\n');
      
      return {
        csv,
        rows: rows.length,
        columns: maxColumns
      };
    } catch (error) {
      console.error('Excel to CSV conversion error:', error);
      // Pass through the error message as-is if it's already user-friendly
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unable to convert Excel file. Please check that the file is a valid Excel document (.xlsx or .xls).');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type based on conversion mode
    const expectedExtensions = conversionMode === 'csv-to-excel' ? ['.csv'] : ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    
    const isValidExtension = expectedExtensions.some(ext => fileName.endsWith(ext));
    if (!isValidExtension) {
      const extensionsText = expectedExtensions.join(', ');
      alert(`Please select a valid file (${extensionsText})`);
      return;
    }

    // Check file size
    if (file.size > MAX_INPUT_SIZE) {
      alert(`File too large! Maximum size is ${formatFileSize(MAX_INPUT_SIZE)}. Your file is ${formatFileSize(file.size)}.`);
      return;
    }

    // Additional validation for Excel files
    if (conversionMode === 'excel-to-csv' && (fileName.endsWith('.xlsx') || fileName.endsWith('.xls'))) {
      // Check if file is not empty
      if (file.size === 0) {
        alert('Excel file appears to be empty. Please select a valid Excel file.');
        return;
      }
      
      // Basic file header validation for Excel files
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (arrayBuffer) {
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Check for Excel file signatures
          const isXLSX = uint8Array[0] === 0x50 && uint8Array[1] === 0x4B; // PK (ZIP signature)
          const isXLS = uint8Array[0] === 0xD0 && uint8Array[1] === 0xCF; // OLE signature
          
          if (!isXLSX && !isXLS) {
            alert('Selected file does not appear to be a valid Excel file. Please check the file format.');
            return;
          }
          
          // Warn about old .xls format
          if (isXLS && !isXLSX) {
            if (!confirm('⚠️ This appears to be an older Excel format (.xls).\n\nOur converter works best with modern .xlsx files. You may experience issues.\n\nRecommendation: Open the file in Excel and save as .xlsx format.\n\nDo you want to try converting it anyway?')) {
              return;
            }
          }
          
          // If validation passes, set the file
          setUploadedFile(file);
          setInputMode('file');
          setInputText('');
          setStatus('idle');
          setConvertedData(null);
        }
      };
      reader.readAsArrayBuffer(file.slice(0, 8)); // Read only first 8 bytes for signature check
      return;
    }

    setUploadedFile(file);
    setInputMode('file');
    setInputText(''); // Clear text input
    setStatus('idle');
    setConvertedData(null);
    setErrorMessage('');

    // File is uploaded, no need to read content into text input
    // Content will be read during conversion for better performance
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
    
    const file = e.dataTransfer.files[0];
    if (file) {
      // Check file type based on conversion mode
      const expectedExtensions = conversionMode === 'csv-to-excel' ? ['.csv'] : ['.xlsx', '.xls'];
      const fileName = file.name.toLowerCase();
      
      const isValidExtension = expectedExtensions.some(ext => fileName.endsWith(ext));
      if (!isValidExtension) {
        const extensionsText = expectedExtensions.join(', ');
        alert(`Please select a valid file (${extensionsText})`);
        return;
      }

      // Check file size
      if (file.size > MAX_INPUT_SIZE) {
        alert(`File too large! Maximum size is ${formatFileSize(MAX_INPUT_SIZE)}. Your file is ${formatFileSize(file.size)}.`);
        return;
      }

      setUploadedFile(file);
      setInputMode('file');
      setInputText(''); // Clear text input
      setStatus('idle');
      setConvertedData(null);

      // File is uploaded, no need to read content into text input
      // Content will be read during conversion for better performance
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setInputText('');
    setStatus('idle');
    setConvertedData(null);
  };

  const handleConvert = async () => {
    // For Excel to CSV mode, we need an uploaded file
    if (conversionMode === 'excel-to-csv' && !uploadedFile) {
      alert('Please upload an Excel file first');
      return;
    }
    
    // Check if we have input data
    if (conversionMode === 'csv-to-excel') {
      if (inputMode === 'file' && !uploadedFile) {
        alert('Please upload a CSV file or paste CSV data');
        return;
      }
      if (inputMode === 'text' && !inputText.trim()) {
        alert('Please paste your CSV data');
        return;
      }
    }

    // Check file size limits
    const currentSize = inputMode === 'file' && uploadedFile ? uploadedFile.size : inputText.length;
    if (currentSize > MAX_INPUT_SIZE) {
      alert(`File too large! Maximum size is ${formatFileSize(MAX_INPUT_SIZE)}. Your file is ${formatFileSize(currentSize)}.`);
      return;
    }

    setStatus('processing');
    setProgress(0);

    try {
      if (conversionMode === 'excel-to-csv') {
        // Excel to CSV conversion
        if (!uploadedFile) return;
        
        setProgress(20);
        const { csv, rows, columns } = await excelToCSV(uploadedFile);
        
        setProgress(80);
        
        const result: ConvertedResult = {
          fileName: `converted_${Date.now()}.csv`,
          rows,
          columns,
          fileSize: new Blob([csv]).size,
          preview: csv.split('\n').slice(0, 10).map(line => line.split(getDelimiter(options.delimiter)))
        };
        
        // Store CSV data in a way that can be downloaded
        const csvBlob = new Blob([csv], { type: 'text/csv' });
        const buffer = await csvBlob.arrayBuffer();
        result.buffer = buffer;
        
        setConvertedData(result);
        setProgress(100);
        setStatus('success');
        return;
      }
      
      // CSV to Excel conversion
      let csvContent: string;
      
      if (inputMode === 'file' && uploadedFile) {
        // Read file content directly
        csvContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(uploadedFile);
        });
      } else {
        // Use text input
        csvContent = inputText;
      }
      
      const delimiter = getDelimiter(options.delimiter);
      const data = parseCSV(csvContent, delimiter);
      
      // Check row/column limits
      if (data.length > MAX_ROWS) {
        alert(`Too many rows! Maximum is ${MAX_ROWS.toLocaleString()} rows. Your file has ${data.length.toLocaleString()} rows.`);
        setStatus('idle');
        return;
      }

      if (data[0] && data[0].length > MAX_COLUMNS) {
        alert(`Too many columns! Maximum is ${MAX_COLUMNS} columns. Your file has ${data[0].length} columns.`);
        setStatus('idle');
        return;
      }

      setProgress(20);

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(options.sheetName);
      
      setProgress(40);

      // Add data to worksheet
      data.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const cellRef = worksheet.getCell(rowIndex + 1, colIndex + 1);
          cellRef.value = cell;
          
          // Style header row
          if (rowIndex === 0 && options.hasHeaders) {
            cellRef.font = { bold: true };
            cellRef.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE6F3FF' }
            };
            cellRef.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }
        });
      });

      setProgress(60);

      // Auto width columns
      if (options.autoWidth) {
        const columnCount = data[0]?.length || 0;
        for (let col = 1; col <= columnCount; col++) {
          let maxLength = 0;
          for (let row = 1; row <= data.length; row++) {
            const cell = worksheet.getCell(row, col);
            const cellValue = cell.value ? cell.value.toString() : '';
            if (cellValue.length > maxLength) {
              maxLength = cellValue.length;
            }
          }
          const column = worksheet.getColumn(col);
          column.width = Math.min(maxLength + 2, 50);
        }
      }

      setProgress(80);

      // Freeze header row
      if (options.freezeHeader && options.hasHeaders) {
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];
      }

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      
      setProgress(100);

      // Create result
      const result: ConvertedResult = {
        fileName: `converted_${Date.now()}.xlsx`,
        rows: data.length,
        columns: data[0]?.length || 0,
        fileSize: buffer.byteLength,
        preview: data.slice(0, 10),
        buffer: buffer
      };

      setConvertedData(result);
      setStatus('success');
      
    } catch (error) {
      console.error('Conversion error:', error);
      setStatus('error');
      
      // Set user-friendly error message
      const message = error instanceof Error ? error.message : 'An unexpected error occurred during conversion';
      setErrorMessage(message);
    }
  };

  const handleDownload = () => {
    if (!convertedData?.buffer) return;
    
    try {
      const mimeType = conversionMode === 'csv-to-excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv';
        
      const blob = new Blob([convertedData.buffer], { type: mimeType });
      
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

  const loadSample = () => {
    const sample = `Product,Category,Price,Stock
Laptop,Electronics,999.99,45
Mouse,Electronics,29.99,150
Keyboard,Electronics,79.99,89
Monitor,Electronics,299.99,34
Headphones,Electronics,149.99,67
Desk Chair,Furniture,249.99,23
Standing Desk,Furniture,499.99,12
Coffee Maker,Appliances,89.99,56`;
    setInputText(sample);
    setStatus('idle');
    setConvertedData(null);
    setErrorMessage('');
  };

  const clearAll = () => {
    setInputText('');
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
    <>
    <Script id="ld-csv-to-excel" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "CSV to Excel Converter",
        applicationCategory: "UtilityApplication",
        operatingSystem: "Web",
        url: "https://converto.dev/tools/csv-to-excel",
        offers: {
          "@type": "Offer",
          price: 0,
          priceCurrency: "USD"
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "120"
        }
      })}
    </Script>
    <ConverterLayout
      title={conversionMode === 'csv-to-excel' ? "CSV to Excel Converter" : "Excel to CSV Converter"}
      description={
        conversionMode === 'csv-to-excel'
          ? "Convert CSV files to Excel spreadsheets (.xlsx format) with custom formatting, headers, and sheet options. Perfect for data analysis and reporting."
          : "Convert Excel spreadsheets (.xlsx) back to CSV format. Extract data from Excel files with your preferred delimiter."
      }
      icon={<Table className="w-8 h-8 text-white" />}
      badge="Free"
    >
      {/* Conversion Mode Toggle */}
      <div className="mb-6 flex items-center justify-center">
        <div className="inline-flex items-center bg-white rounded-xl p-1.5 border-2 border-gray-200 shadow-sm">
          <button
            onClick={() => {
              setConversionMode('csv-to-excel');
              setInputText('');
              setUploadedFile(null);
              setConvertedData(null);
              setStatus('idle');
              setErrorMessage('');
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              conversionMode === 'csv-to-excel'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            CSV → Excel
          </button>
          <button
            onClick={() => {
              setConversionMode('excel-to-csv');
              setInputText('');
              setUploadedFile(null);
              setConvertedData(null);
              setStatus('idle');
              setErrorMessage('');
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              conversionMode === 'excel-to-csv'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Table className="w-4 h-4" />
            Excel → CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Input & Preview (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Input & Preview Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Area */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {conversionMode === 'csv-to-excel' ? (
                    <FileText className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Table className="w-5 h-5 text-green-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conversionMode === 'csv-to-excel' ? 'CSV' : 'Excel'} Input
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={loadSample}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    Load Sample
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
                    className={`border-2 border-dashed rounded-lg text-center transition-colors p-12 h-[400px] flex items-center justify-center ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    <input
                      type="file"
                      accept={conversionMode === 'csv-to-excel' ? '.csv' : '.xlsx,.xls'}
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
                        {isDragging 
                          ? `Drop your ${conversionMode === 'csv-to-excel' ? 'CSV' : 'Excel (.xlsx, .xls)'} file here`
                          : `Click to upload ${conversionMode === 'csv-to-excel' ? 'CSV' : 'Excel (.xlsx, .xls)'} file`
                        }
                      </p>
                      <p className="text-gray-500 text-base">or drag and drop</p>
                      <p className="text-xs text-gray-400">Max size: {formatFileSize(MAX_INPUT_SIZE)}</p>
                    </label>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="w-full max-w-2xl">
                      {/* Clean File Card */}
                      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        {/* File Content */}
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
                            {/* Large File Icon */}
                            <div className="flex-shrink-0">
                              <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center">
                                {conversionMode === 'csv-to-excel' ? (
                                  <FileText className="text-indigo-600 w-12 h-12" />
                                ) : (
                                  <Table className="text-indigo-600 w-12 h-12" />
                                )}
                              </div>
                            </div>

                            {/* File Info */}
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
                                accept={conversionMode === 'csv-to-excel' ? '.csv' : '.xlsx,.xls'}
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <div className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow">
                                <Upload className="w-4 h-4" />
                                Choose Different File
                              </div>
                            </label>
                            <button
                              onClick={removeUploadedFile}
                              className="px-3 py-2.5 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 rounded-lg transition-all flex items-center justify-center"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Input Area - Only show for CSV to Excel mode when no file is uploaded */}
              {conversionMode === 'csv-to-excel' && !uploadedFile && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or paste your CSV data directly:
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      setStatus('idle');
                      setConvertedData(null);
                    }}
                    placeholder="Paste your CSV data here...\n\nProduct,Price,Stock\nLaptop,999.99,45\nMouse,29.99,150"
                    className="w-full min-h-[200px] max-h-[400px] h-[250px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 text-sm font-mono text-gray-900 bg-gray-50 resize-y transition-colors textarea-scrollbar"
                  />
                </div>
              )}

              {/* File info and warnings - Only show for CSV to Excel mode when no file is uploaded */}
              {conversionMode === 'csv-to-excel' && !uploadedFile && (
                <>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>{inputText.split('\n').filter(l => l.trim()).length} lines</span>
                    <span>{formatFileSize(inputText.length)}</span>
                  </div>

                  {/* File size warning */}
                  {(() => {
                    const currentSize = inputText.length;
                    return currentSize > MAX_INPUT_SIZE * 0.8 && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-yellow-800">Large file detected</p>
                          <p className="text-xs text-yellow-600 mt-1">
                            File size: {formatFileSize(currentSize)} / {formatFileSize(MAX_INPUT_SIZE)} limit
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
              
            </div>

            {/* Right: Preview/Result Area */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Table className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conversionMode === 'csv-to-excel' ? 'Excel' : 'CSV'} Preview
                  </h3>
                </div>
              </div>

              <div className="h-[700px] overflow-auto">
                {status === 'idle' && !convertedData && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Table className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-sm mb-2">Ready to convert</p>
                      <p className="text-gray-500 text-xs">Your Excel preview will appear here</p>
                    </div>
                  </div>
                )}

                {status === 'processing' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Table className="w-8 h-8 text-indigo-600" />
                      </div>
                      <p className="text-gray-900 font-semibold mb-2">Converting to Excel...</p>
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
                    {/* Success Banner */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800">Conversion Successful!</p>
                        <p className="text-xs text-green-600 mt-1">
                          {convertedData.rows} rows × {convertedData.columns} columns
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-xs text-blue-600 mb-1">Rows</p>
                        <p className="text-2xl font-bold text-blue-700">{convertedData.rows}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-xs text-purple-600 mb-1">Columns</p>
                        <p className="text-2xl font-bold text-purple-700">{convertedData.columns}</p>
                      </div>
                    </div>

                    {/* Preview Table */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">Data Preview (first 10 rows):</p>
                      <div className="border border-gray-200 rounded-lg overflow-auto max-h-[400px] textarea-scrollbar">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              {convertedData.preview[0]?.map((header, i) => (
                                <th key={i} className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">
                                  {options.hasHeaders ? header : `Column ${i + 1}`}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {convertedData.preview.slice(options.hasHeaders ? 1 : 0).map((row, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                {row.map((cell, j) => (
                                  <td key={j} className="px-3 py-2 border-b border-gray-100 text-gray-800">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={handleDownload}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download {conversionMode === 'csv-to-excel' ? 'Excel' : 'CSV'} File ({formatFileSize(convertedData.fileSize)})
                    </button>

                    {/* File info */}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800 font-semibold mb-1">File Information</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                        <div>Rows: {convertedData.rows.toLocaleString()}</div>
                        <div>Columns: {convertedData.columns}</div>
                        <div>Size: {formatFileSize(convertedData.fileSize)}</div>
                        <div>Format: {conversionMode === 'csv-to-excel' ? '.xlsx' : '.csv'}</div>
                      </div>
                    </div>
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
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
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

        {/* Right Column: Settings & Actions (1 column) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Settings Panel */}
          <div className="sticky top-24">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-200">
                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Table className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Settings</h3>
              </div>

              {/* Options */}
              <div className="space-y-5">
                {/* Delimiter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-800">Delimiter</label>
                  <select
                    value={options.delimiter}
                    onChange={(e) => setOptions({ ...options, delimiter: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm font-medium text-gray-900 bg-white transition-colors"
                  >
                    <option value="comma">, Comma (,)</option>
                    <option value="semicolon">; Semicolon (;)</option>
                    <option value="tab">⇥ Tab</option>
                    <option value="pipe">| Pipe (|)</option>
                  </select>
                  <p className="text-xs text-gray-500">CSV field separator</p>
                </div>

                {/* Has Headers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-800">First Row as Headers</label>
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={options.hasHeaders}
                        onChange={(e) => setOptions({ ...options, hasHeaders: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-green-600 transition-all duration-200"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Use first row as column headers</p>
                </div>

                {/* Sheet Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-800">Sheet Name</label>
                  <input
                    type="text"
                    value={options.sheetName}
                    onChange={(e) => setOptions({ ...options, sheetName: e.target.value })}
                    placeholder="Sheet1"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm font-medium text-gray-900 bg-white transition-colors"
                  />
                  <p className="text-xs text-gray-500">Name for Excel worksheet</p>
                </div>

                {/* Auto Width */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-800">Auto Column Width</label>
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={options.autoWidth}
                        onChange={(e) => setOptions({ ...options, autoWidth: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-green-600 transition-all duration-200"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Fit columns to content width</p>
                </div>

                {/* Freeze Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-800">Freeze Header Row</label>
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={options.freezeHeader}
                        onChange={(e) => setOptions({ ...options, freezeHeader: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-green-600 transition-all duration-200"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Keep header visible when scrolling</p>
                </div>
              </div>
            </div>

            {/* Convert Button */}
            {(uploadedFile || (conversionMode === 'csv-to-excel' && inputText.trim())) && status !== 'processing' && (
              <button
                onClick={handleConvert}
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Table className="w-5 h-5" />
                Convert to {conversionMode === 'csv-to-excel' ? 'Excel' : 'CSV'}
              </button>
            )}

            {/* Quick Actions */}
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={loadSample}
                  className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-green-50 text-gray-700 hover:text-green-700 rounded-lg transition-colors border border-gray-200 hover:border-green-300"
                >
                  📝 Load Sample Data
                </button>
                <button
                  onClick={clearAll}
                  className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-lg transition-colors border border-gray-200 hover:border-red-300"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Real Excel Files
          </h3>
          <p className="text-sm text-gray-600">
            Creates actual .xlsx files with formatting, headers, and styling. Compatible with Excel, Google Sheets, and LibreOffice.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">⚙️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Professional Formatting
          </h3>
          <p className="text-sm text-gray-600">
            Auto-width columns, frozen headers, bold headers, and borders. Ready for business use.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Fast & Secure
          </h3>
          <p className="text-sm text-gray-600">
            Instant conversion in your browser. No uploads, no server processing. Your data stays private.
          </p>
        </div>
      </div>

      {/* File Limits Info */}
      <div className="mt-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">File Size Limits</h3>
            <p className="text-sm text-yellow-700 mb-3">
              To ensure fast processing and prevent browser crashes, we have the following limits:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 border border-yellow-200">
                <p className="font-semibold text-yellow-800">File Size</p>
                <p className="text-yellow-700">Maximum 5MB</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-yellow-200">
                <p className="font-semibold text-yellow-800">Rows</p>
                <p className="text-yellow-700">Maximum 10,000 rows</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-yellow-200">
                <p className="font-semibold text-yellow-800">Columns</p>
                <p className="text-yellow-700">Maximum 100 columns</p>
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-3">
              💡 For larger files, consider splitting your data or using a desktop application.
            </p>
          </div>
        </div>
      </div>
    </ConverterLayout>
    </>
  );
}

export default function CSVToExcel() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CSVToExcelContent />
    </Suspense>
  );
}

