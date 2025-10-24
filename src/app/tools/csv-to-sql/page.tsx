'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Database, Upload, Download, Copy, RefreshCw, Trash2, FileText, Check, CheckCircle, X } from 'react-feather';
import ConverterLayout from '@/components/converters/ConverterLayout';

type ConversionStatus = 'idle' | 'processing' | 'success' | 'error';

interface ConversionOptions {
  delimiter: 'comma' | 'semicolon' | 'tab' | 'pipe';
  hasHeaders: boolean;
  tableName: string;
  batchSize: number;
  databaseType: 'mysql' | 'postgresql' | 'sqlite';
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function CSVToSQL() {
  const searchParams = useSearchParams();
  const modeFromUrl = searchParams.get('mode') as 'csv-to-sql' | 'sql-to-csv' | null;

  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [sqlOutput, setSqlOutput] = useState<string>('');
  const [showCopied, setShowCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [conversionMode, setConversionMode] = useState<'csv-to-sql' | 'sql-to-csv'>(modeFromUrl || 'csv-to-sql');
  const [options, setOptions] = useState<ConversionOptions>({
    delimiter: 'comma',
    hasHeaders: true,
    tableName: 'my_table',
    batchSize: 100,
    databaseType: 'mysql'
  });

  useEffect(() => {
    if (modeFromUrl && (modeFromUrl === 'csv-to-sql' || modeFromUrl === 'sql-to-csv')) {
      setConversionMode(modeFromUrl);
    }
  }, [modeFromUrl]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    const expectedExtensions = conversionMode === 'csv-to-sql' ? ['.csv'] : ['.sql'];
    const isValidFile = expectedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidFile) {
      alert(`Please upload a ${conversionMode === 'csv-to-sql' ? 'CSV' : 'SQL'} file`);
      return;
    }
    
    setUploadedFile(file);
    setInputMode('file');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setInputText('');
    setInputMode('text');
  };

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

  const parseSQLInsert = (sql: string): string[][] => {
    const lines = sql.trim().split('\n');
    const data: string[][] = [];
    
    for (const line of lines) {
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('--') || line.trim().startsWith('/*')) continue;
      
      // Look for INSERT INTO statements
      const insertMatch = line.match(/INSERT\s+INTO\s+(\w+)\s*\([^)]*\)\s*VALUES\s*\(([^)]+)\)/i);
      if (insertMatch) {
        const valuesPart = insertMatch[2];
        
        // Parse values - handle both single quotes and double quotes
        const values: string[] = [];
        let currentValue = '';
        let inQuotes = false;
        let quoteChar = '';
        
        for (let i = 0; i < valuesPart.length; i++) {
          const char = valuesPart[i];
          
          if (!inQuotes && (char === "'" || char === '"')) {
            inQuotes = true;
            quoteChar = char;
          } else if (inQuotes && char === quoteChar) {
            // Check if it's escaped
            if (i > 0 && valuesPart[i-1] === '\\') {
              currentValue += char;
            } else {
              inQuotes = false;
              quoteChar = '';
            }
          } else if (!inQuotes && char === ',') {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        // Add the last value
        if (currentValue.trim()) {
          values.push(currentValue.trim());
        }
        
        if (values.length > 0) {
          data.push(values);
        }
      }
    }
    
    if (data.length === 0) {
      throw new Error('No SQL INSERT statements found');
    }
    
    return data;
  };

  const escapeSQL = (value: string, dbType: string): string => {
    // Escape single quotes
    let escaped = value.replace(/'/g, "''");
    
    // For PostgreSQL and SQLite, also handle backslashes
    if (dbType === 'postgresql' || dbType === 'sqlite') {
      escaped = escaped.replace(/\\/g, '\\\\');
    }
    
    return `'${escaped}'`;
  };

  const csvToSQL = (csvText: string): string => {
    const delimiter = getDelimiter(options.delimiter);
    const rows = parseCSV(csvText, delimiter);
    
    if (rows.length === 0) return '';

    let sql = '';
    let columnNames: string[] = [];

    // Determine column names
    if (options.hasHeaders && rows.length > 0) {
      columnNames = rows[0].map(col => col.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase());
    } else {
      // Generate generic column names
      const numColumns = rows[0]?.length || 0;
      columnNames = Array.from({ length: numColumns }, (_, i) => `column${i + 1}`);
    }

    // Add comment header
    sql += `-- CSV to SQL INSERT Statements\n`;
    sql += `-- Table: ${options.tableName}\n`;
    sql += `-- Database: ${options.databaseType.toUpperCase()}\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n\n`;

    // Create table statement
    sql += generateCreateTable(columnNames, rows);
    sql += '\n\n';

    // Get data rows
    const dataRows = options.hasHeaders ? rows.slice(1) : rows;
    
    // Generate INSERT statements
    const batches = Math.ceil(dataRows.length / options.batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchStart = batch * options.batchSize;
      const batchEnd = Math.min((batch + 1) * options.batchSize, dataRows.length);
      const batchRows = dataRows.slice(batchStart, batchEnd);
      
      if (options.databaseType === 'mysql') {
        // MySQL multi-row INSERT
        sql += `INSERT INTO ${options.tableName} (${columnNames.join(', ')}) VALUES\n`;
        batchRows.forEach((row, idx) => {
          const values = row.map(cell => escapeSQL(cell, options.databaseType)).join(', ');
          sql += `  (${values})${idx === batchRows.length - 1 ? ';' : ','}\n`;
        });
      } else if (options.databaseType === 'postgresql') {
        // PostgreSQL multi-row INSERT
        sql += `INSERT INTO ${options.tableName} (${columnNames.join(', ')}) VALUES\n`;
        batchRows.forEach((row, idx) => {
          const values = row.map(cell => escapeSQL(cell, options.databaseType)).join(', ');
          sql += `  (${values})${idx === batchRows.length - 1 ? ';' : ','}\n`;
        });
      } else {
        // SQLite individual INSERTs
        batchRows.forEach(row => {
          const values = row.map(cell => escapeSQL(cell, options.databaseType)).join(', ');
          sql += `INSERT INTO ${options.tableName} (${columnNames.join(', ')}) VALUES (${values});\n`;
        });
      }
      
      sql += '\n';
    }

    return sql.trim();
  };

  const generateCreateTable = (columns: string[], rows: string[][]): string => {
    let sql = `CREATE TABLE IF NOT EXISTS ${options.tableName} (\n`;
    
    columns.forEach((col, idx) => {
      sql += `  ${col} VARCHAR(255)${idx === columns.length - 1 ? '' : ','}\n`;
    });
    
    sql += ');';
    return sql;
  };


  const handleConvert = (content?: string) => {
    const inputContent = content || inputText;
    if (!inputContent.trim()) return;

    setStatus('processing');
    
    try {
      let result: string;
      if (conversionMode === 'csv-to-sql') {
        result = csvToSQL(inputContent);
      } else {
        // SQL to CSV conversion
        const data = parseSQLInsert(inputContent);
        const delimiter = getDelimiter(options.delimiter);
        result = data.map(row => row.join(delimiter)).join('\n');
      }
      setSqlOutput(result);
      setStatus('success');
    } catch (error) {
      console.error('Conversion error:', error);
      setStatus('error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlOutput);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${options.tableName}_${Date.now()}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    let sample: string;
    if (conversionMode === 'csv-to-sql') {
      sample = `Product,Category,Price,Stock
Laptop,Electronics,999.99,45
Mouse,Electronics,29.99,150
Keyboard,Electronics,79.99,89
Monitor,Electronics,299.99,34`;
    } else {
      sample = `INSERT INTO products (Product, Category, Price, Stock) VALUES ('Laptop', 'Electronics', 999.99, 45);
INSERT INTO products (Product, Category, Price, Stock) VALUES ('Mouse', 'Electronics', 29.99, 150);
INSERT INTO products (Product, Category, Price, Stock) VALUES ('Keyboard', 'Electronics', 79.99, 89);
INSERT INTO products (Product, Category, Price, Stock) VALUES ('Monitor', 'Electronics', 299.99, 34);`;
    }
    setInputText(sample);
    setUploadedFile(null);
    setInputMode('text');
    handleConvert(sample);
  };

  const clearAll = () => {
    setInputText('');
    setUploadedFile(null);
    setSqlOutput('');
    setStatus('idle');
  };

  return (
    <ConverterLayout
      title={conversionMode === 'csv-to-sql' ? 'CSV to SQL INSERT Converter' : 'SQL to CSV Converter'}
      description={conversionMode === 'csv-to-sql' 
        ? 'Convert CSV files to SQL INSERT statements. Supports MySQL, PostgreSQL, and SQLite.'
        : 'Convert SQL INSERT statements to CSV format. Extract data from SQL INSERT statements into spreadsheet format.'
      }
      icon={<Database className="w-8 h-8 text-white" />}
      badge="Free"
    >
      {/* Conversion Mode Toggle */}
      <div className="mb-6 flex items-center justify-center">
        <div className="inline-flex items-center bg-white rounded-xl p-1.5 border-2 border-gray-200 shadow-sm">
          <button
            onClick={() => {
              setConversionMode('csv-to-sql');
              setInputText('');
              setUploadedFile(null);
              setSqlOutput('');
              setStatus('idle');
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              conversionMode === 'csv-to-sql'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            CSV → SQL
          </button>
          <button
            onClick={() => {
              setConversionMode('sql-to-csv');
              setInputText('');
              setUploadedFile(null);
              setSqlOutput('');
              setStatus('idle');
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              conversionMode === 'sql-to-csv'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database className="w-4 h-4" />
            SQL → CSV
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
                  {conversionMode === 'csv-to-sql' ? (
                    <FileText className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Database className="w-5 h-5 text-green-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conversionMode === 'csv-to-sql' ? 'CSV' : 'SQL'} Input
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
                      accept={conversionMode === 'csv-to-sql' ? '.csv' : '.sql'}
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
                          ? `Drop your ${conversionMode === 'csv-to-sql' ? 'CSV' : 'SQL'} file here` 
                          : `Click to upload ${conversionMode === 'csv-to-sql' ? 'CSV' : 'SQL'} file`
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
                              <div className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-center transition-colors">
                                Choose Different File
                              </div>
                            </label>
                            <button
                              onClick={removeUploadedFile}
                              className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-semibold transition-colors"
                            >
                              Remove
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
                  Or paste your {conversionMode === 'csv-to-sql' ? 'CSV' : 'SQL'} data directly:
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setStatus('idle');
                  }}
                  placeholder={conversionMode === 'csv-to-sql' 
                    ? "Product,Category,Price,Stock\nLaptop,Electronics,999.99,45\nMouse,Electronics,29.99,150"
                    : "INSERT INTO products (Product, Category, Price) VALUES ('Laptop', 'Electronics', 999.99);\nINSERT INTO products (Product, Category, Price) VALUES ('Mouse', 'Electronics', 29.99);"
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
                  {conversionMode === 'csv-to-sql' ? (
                    <Database className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-green-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conversionMode === 'csv-to-sql' ? 'SQL' : 'CSV'} Output
                  </h3>
                </div>
                {sqlOutput && (
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
                {sqlOutput ? (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs max-h-[400px] overflow-y-auto">
                    <code>{sqlOutput}</code>
                  </pre>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Database className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p>SQL output will appear here</p>
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
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Settings</h3>
              </div>

              <div className="space-y-5">
                {/* Database Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-800">Database Type</label>
                  <select
                    value={options.databaseType}
                    onChange={(e) => setOptions({...options, databaseType: e.target.value as any})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="mysql">MySQL</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="sqlite">SQLite</option>
                  </select>
                </div>

                {/* Table Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-800">Table Name</label>
                  <input
                    type="text"
                    value={options.tableName}
                    onChange={(e) => setOptions({...options, tableName: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="my_table"
                  />
                </div>

                {/* Delimiter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-800">Delimiter</label>
                  <select
                    value={options.delimiter}
                    onChange={(e) => setOptions({...options, delimiter: e.target.value as any})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="comma">Comma (,)</option>
                    <option value="semicolon">Semicolon (;)</option>
                    <option value="tab">Tab</option>
                    <option value="pipe">Pipe (|)</option>
                  </select>
                </div>

                {/* Batch Size */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-800">Batch Size</label>
                  <input
                    type="number"
                    value={options.batchSize}
                    onChange={(e) => setOptions({...options, batchSize: parseInt(e.target.value) || 100})}
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  />
                  <p className="text-xs text-gray-500">Rows per INSERT statement</p>
                </div>

                {/* Has Headers */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-800">First row as headers</label>
                  <button
                    onClick={() => setOptions({...options, hasHeaders: !options.hasHeaders})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      options.hasHeaders ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        options.hasHeaders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Convert Button */}
              {inputText.trim() && inputMode === 'text' && (
                <button
                  onClick={() => handleConvert()}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Database className="w-5 h-5" />
                  Convert to SQL
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ConverterLayout>
  );
}

