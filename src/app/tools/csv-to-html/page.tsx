'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Table, Upload, Download, Copy, FileText, Check, X, CheckCircle } from 'react-feather';
import ConverterLayout from '@/components/converters/ConverterLayout';


interface ConversionOptions {
  delimiter: 'comma' | 'semicolon' | 'tab' | 'pipe';
  hasHeaders: boolean;
  tableBorder: boolean;
  stripedRows: boolean;
  responsive: boolean;
}

function CSVToHTMLContent() {
  const searchParams = useSearchParams();
  const modeFromUrl = searchParams.get('mode') as 'csv-to-html' | 'html-to-csv' | null;

  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [htmlOutput, setHtmlOutput] = useState<string>('');
  const [showCopied, setShowCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [conversionMode, setConversionMode] = useState<'csv-to-html' | 'html-to-csv'>(modeFromUrl || 'csv-to-html');
  const [options, setOptions] = useState<ConversionOptions>({
    delimiter: 'comma',
    hasHeaders: true,
    tableBorder: true,
    stripedRows: true,
    responsive: true
  });

  useEffect(() => {
    if (modeFromUrl && (modeFromUrl === 'csv-to-html' || modeFromUrl === 'html-to-csv')) {
      setConversionMode(modeFromUrl);
    }
  }, [modeFromUrl]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const getDelimiter = (type: string): string => {
    switch (type) {
      case 'comma': return ',';
      case 'semicolon': return ';';
      case 'tab': return '\t';
      case 'pipe': return '|';
      default: return ',';
    }
  };

  const parseCSV = (text: string, delimiter: string): string[][] => {
    const lines = text.trim().split('\n');
    return lines.map(line => {
      return line.split(delimiter).map(cell => cell.trim());
    });
  };

  const parseHTMLTable = (html: string): string[][] => {
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tables = doc.querySelectorAll('table');
    
    if (tables.length === 0) {
      throw new Error('No HTML tables found');
    }
    
    const table = tables[0]; // Use the first table
    const rows = table.querySelectorAll('tr');
    const data: string[][] = [];
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td, th');
      const rowData: string[] = [];
      cells.forEach(cell => {
        rowData.push(cell.textContent?.trim() || '');
      });
      if (rowData.length > 0) {
        data.push(rowData);
      }
    });
    
    return data;
  };

  const csvToHTML = (csvText: string): string => {
    const delimiter = getDelimiter(options.delimiter);
    const rows = parseCSV(csvText, delimiter);
    
    if (rows.length === 0) return '';

    let html = options.responsive 
      ? '<div class="table-responsive">\n<table' 
      : '<table';
    
    if (options.tableBorder) {
      html += ' border="1"';
    }
    
    if (options.stripedRows) {
      html += ' class="striped"';
    }
    
    html += '>\n';

    // Add header
    if (options.hasHeaders && rows.length > 0) {
      html += '  <thead>\n    <tr>\n';
      rows[0].forEach(cell => {
        html += `      <th>${escapeHtml(cell)}</th>\n`;
      });
      html += '    </tr>\n  </thead>\n';
    }

    // Add body
    html += '  <tbody>\n';
    const dataRows = options.hasHeaders ? rows.slice(1) : rows;
    dataRows.forEach(row => {
      html += '    <tr>\n';
      row.forEach(cell => {
        html += `      <td>${escapeHtml(cell)}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n</table>';
    
    if (options.responsive) {
      html += '\n</div>';
    }

    // Add CSS if needed
    if (options.stripedRows || options.tableBorder || options.responsive) {
      html = addCSS() + '\n\n' + html;
    }

    return html;
  };

  const addCSS = (): string => {
    let css = '<style>\n';
    
    if (options.tableBorder) {
      css += '  table { border-collapse: collapse; width: 100%; }\n';
      css += '  th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }\n';
      css += '  th { background-color: #f2f2f2; font-weight: bold; }\n';
    }
    
    if (options.stripedRows) {
      css += '  tbody tr:nth-child(even) { background-color: #f9f9f9; }\n';
    }
    
    if (options.responsive) {
      css += '  .table-responsive { overflow-x: auto; }\n';
    }
    
    css += '</style>';
    return css;
  };

  const escapeHtml = (text: string): string => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
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
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    const expectedExtensions = conversionMode === 'csv-to-html' ? ['.csv'] : ['.html', '.htm'];
    const isValidFile = expectedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidFile) {
      alert(`Please select a valid ${conversionMode === 'csv-to-html' ? 'CSV' : 'HTML'} file`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    setUploadedFile(file);
    setHtmlOutput('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleConvert(content);
    };
    reader.readAsText(file);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setHtmlOutput('');
    setStatus('idle');
  };

  const handleConvert = (content?: string) => {
    const inputContent = content || inputText;
    if (!inputContent.trim()) return;

    setStatus('processing');
    
    try {
      let result: string;
      if (conversionMode === 'csv-to-html') {
        result = csvToHTML(inputContent);
      } else {
        // HTML to CSV conversion
        const data = parseHTMLTable(inputContent);
        const delimiter = getDelimiter(options.delimiter);
        result = data.map(row => row.join(delimiter)).join('\n');
      }
      setHtmlOutput(result);
      setStatus('success');
    } catch (error) {
      console.error('Conversion error:', error);
      setStatus('error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlOutput);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlOutput], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    let sample: string;
    if (conversionMode === 'csv-to-html') {
      sample = `Product,Category,Price,Stock
Laptop,Electronics,999.99,45
Mouse,Electronics,29.99,150
Keyboard,Electronics,79.99,89
Monitor,Electronics,299.99,34`;
    } else {
      sample = `<table>
  <tr>
    <th>Product</th>
    <th>Category</th>
    <th>Price</th>
    <th>Stock</th>
  </tr>
  <tr>
    <td>Laptop</td>
    <td>Electronics</td>
    <td>999.99</td>
    <td>45</td>
  </tr>
  <tr>
    <td>Mouse</td>
    <td>Electronics</td>
    <td>29.99</td>
    <td>150</td>
  </tr>
</table>`;
    }
    setInputText(sample);
    setUploadedFile(null);
    handleConvert(sample);
  };


  return (
    <ConverterLayout
      title={conversionMode === 'csv-to-html' ? 'CSV to HTML Table Converter' : 'HTML to CSV Converter'}
      description={conversionMode === 'csv-to-html' 
        ? 'Convert CSV files to HTML tables with custom styling. Perfect for embedding tables in web pages.'
        : 'Convert HTML tables to CSV format. Extract data from HTML tables into spreadsheet format.'
      }
      icon={<Table className="w-8 h-8 text-white" />}
      badge="Free"
    >
      {/* Conversion Mode Toggle */}
      <div className="mb-6 flex items-center justify-center">
        <div className="inline-flex items-center bg-white rounded-xl p-1.5 border-2 border-gray-200 shadow-sm">
          <button
            onClick={() => {
              setConversionMode('csv-to-html');
              setInputText('');
              setUploadedFile(null);
              setHtmlOutput('');
              setStatus('idle');
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              conversionMode === 'csv-to-html'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            CSV → HTML
          </button>
          <button
            onClick={() => {
              setConversionMode('html-to-csv');
              setInputText('');
              setUploadedFile(null);
              setHtmlOutput('');
              setStatus('idle');
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              conversionMode === 'html-to-csv'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Table className="w-4 h-4" />
            HTML → CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Input & Output (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Input & Output Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Area */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {conversionMode === 'csv-to-html' ? (
                    <FileText className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Table className="w-5 h-5 text-green-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conversionMode === 'csv-to-html' ? 'CSV' : 'HTML'} Input
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
                      accept={conversionMode === 'csv-to-html' ? '.csv' : '.html,.htm'}
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
                          ? `Drop your ${conversionMode === 'csv-to-html' ? 'CSV' : 'HTML'} file here` 
                          : `Click to upload ${conversionMode === 'csv-to-html' ? 'CSV' : 'HTML'} file`
                        }
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
                            <span className="text-sm font-semibold text-green-700">File Uploaded</span>
                          </div>
                        </div>

                        {/* File Display */}
                        <div className="flex items-center gap-6 mb-8">
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center">
                              <FileText className="text-indigo-600 w-12 h-12" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 truncate" title={uploadedFile.name}>
                              {uploadedFile.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="font-medium">{formatFileSize(uploadedFile.size)}</span>
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span className="font-medium">CSV File</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              accept=".csv"
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

            {/* Text Input Alternative */}
            {!uploadedFile && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or paste your {conversionMode === 'csv-to-html' ? 'CSV' : 'HTML'} data directly:
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setStatus('idle');
                  }}
                  placeholder={conversionMode === 'csv-to-html' 
                    ? "Product,Category,Price,Stock\nLaptop,Electronics,999.99,45\nMouse,Electronics,29.99,150"
                    : "<table>\n  <tr><th>Product</th><th>Category</th></tr>\n  <tr><td>Laptop</td><td>Electronics</td></tr>\n</table>"
                  }
                  className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-mono text-gray-900 bg-gray-50 resize-none transition-colors"
                />
              </div>
            )}
            </div>

            {/* Right: Output Area */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {conversionMode === 'csv-to-html' ? (
                    <Table className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-green-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conversionMode === 'csv-to-html' ? 'HTML' : 'CSV'} Output
                  </h3>
                </div>
                {htmlOutput && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1"
                    >
                      {showCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {showCopied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                )}
              </div>

              <div className="min-h-[400px]">
                {htmlOutput ? (
                  <div>
                    {/* HTML Code */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">HTML Code:</h4>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                        <code>{htmlOutput}</code>
                      </pre>
                    </div>
                    
                    {/* Preview */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Preview:</h4>
                      <div 
                        className="border border-gray-200 rounded-lg p-4 overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: htmlOutput }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Table className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p>HTML output will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-24">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-200">
                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Table className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Settings</h3>
              </div>

              <div className="space-y-5">
                {/* Delimiter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-800">Delimiter</label>
                  <select
                    value={options.delimiter}
                    onChange={(e) => setOptions({...options, delimiter: e.target.value as 'comma' | 'semicolon' | 'tab'})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                  >
                    <option value="comma">Comma (,)</option>
                    <option value="semicolon">Semicolon (;)</option>
                    <option value="tab">Tab</option>
                    <option value="pipe">Pipe (|)</option>
                  </select>
                </div>

                {/* Has Headers */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-800">First row as headers</label>
                  <button
                    onClick={() => setOptions({...options, hasHeaders: !options.hasHeaders})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      options.hasHeaders ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        options.hasHeaders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Table Border */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-800">Table border</label>
                  <button
                    onClick={() => setOptions({...options, tableBorder: !options.tableBorder})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      options.tableBorder ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        options.tableBorder ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Striped Rows */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-800">Striped rows</label>
                  <button
                    onClick={() => setOptions({...options, stripedRows: !options.stripedRows})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      options.stripedRows ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        options.stripedRows ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Responsive */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-800">Responsive wrapper</label>
                  <button
                    onClick={() => setOptions({...options, responsive: !options.responsive})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      options.responsive ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        options.responsive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Convert Button */}
              {inputText.trim() && !uploadedFile && (
                <button
                  onClick={() => handleConvert()}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Table className="w-5 h-5" />
                  Convert to HTML
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ConverterLayout>
  );
}

export default function CSVToHTML() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CSVToHTMLContent />
    </Suspense>
  );
}

