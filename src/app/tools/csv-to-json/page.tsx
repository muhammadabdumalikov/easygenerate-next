'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Code, Copy } from 'react-feather';
import ConverterLayout from '@/components/converters/ConverterLayout';
import OptionsPanel, { OptionConfig } from '@/components/converters/OptionsPanel';
import ResultPreview, { ConversionStatus } from '@/components/converters/ResultPreview';

interface ConvertedResult {
  json: string;
  parsed: unknown;
  lines: number;
  size: number;
}

function CSVToJSONContent() {
  const searchParams = useSearchParams();
  const modeFromUrl = searchParams.get('mode') as 'csv-to-json' | 'json-to-csv' | null;

  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [convertedData, setConvertedData] = useState<ConvertedResult | null>(null);
  const [showCopied, setShowCopied] = useState(false);
  const [conversionMode, setConversionMode] = useState<'csv-to-json' | 'json-to-csv'>(modeFromUrl || 'csv-to-json');
  const [options, setOptions] = useState({
    delimiter: 'comma',
    includeHeaders: true,
    prettyPrint: true,
    arrayFormat: 'nested',
    skipEmptyLines: true
  });

  useEffect(() => {
    if (modeFromUrl && (modeFromUrl === 'csv-to-json' || modeFromUrl === 'json-to-csv')) {
      setConversionMode(modeFromUrl);
    }
  }, [modeFromUrl]);

  const optionConfigs: OptionConfig[] = [
    {
      id: 'delimiter',
      label: 'Delimiter',
      type: 'select',
      value: options.delimiter,
      options: [
        { value: 'comma', label: 'Comma (,)', icon: ',' },
        { value: 'semicolon', label: 'Semicolon (;)', icon: ';' },
        { value: 'tab', label: 'Tab', icon: '⇥' },
        { value: 'pipe', label: 'Pipe (|)', icon: '|' }
      ],
      description: 'CSV field separator'
    },
    {
      id: 'includeHeaders',
      label: 'First Row as Headers',
      type: 'toggle',
      value: options.includeHeaders,
      description: 'Use first row as object keys'
    },
    {
      id: 'prettyPrint',
      label: 'Pretty Print',
      type: 'toggle',
      value: options.prettyPrint,
      description: 'Format JSON with indentation'
    },
    {
      id: 'arrayFormat',
      label: 'Output Format',
      type: 'select',
      value: options.arrayFormat,
      options: [
        { value: 'nested', label: 'Array of Objects', icon: '[ ]' },
        { value: 'keyed', label: 'Keyed Object', icon: '{ }' }
      ],
      description: 'JSON structure format'
    },
    {
      id: 'skipEmptyLines',
      label: 'Skip Empty Lines',
      type: 'toggle',
      value: options.skipEmptyLines,
      description: 'Ignore blank rows in CSV'
    }
  ];

  const handleOptionChange = (id: string, value: string | number | boolean) => {
    setOptions(prev => ({ ...prev, [id]: value }));
  };

  const getDelimiter = () => {
    switch (options.delimiter) {
      case 'comma': return ',';
      case 'semicolon': return ';';
      case 'tab': return '\t';
      case 'pipe': return '|';
      default: return ',';
    }
  };

  const csvToJson = (csv: string) => {
    const delimiter = getDelimiter();
    const lines = csv.split('\n').filter(line => 
      options.skipEmptyLines ? line.trim() !== '' : true
    );
    
    if (lines.length === 0) return null;

    const headers = options.includeHeaders 
      ? lines[0].split(delimiter).map(h => h.trim())
      : Array.from({ length: lines[0].split(delimiter).length }, (_, i) => `column_${i + 1}`);

    const dataLines = options.includeHeaders ? lines.slice(1) : lines;
    
    const result = dataLines.map((line, index) => {
      const values = line.split(delimiter).map(v => v.trim());
      const obj: Record<string, string | number> = {};
      
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });
      
      if (options.arrayFormat === 'keyed') {
        return { id: index + 1, ...obj };
      }
      
      return obj;
    });

    return options.arrayFormat === 'keyed' 
      ? { data: result, count: result.length }
      : result;
  };

  const jsonToCsv = (jsonString: string) => {
    const data = JSON.parse(jsonString);
    const delimiter = getDelimiter();
    
    // Handle array of objects or object with data property
    const items = Array.isArray(data) ? data : (data.data || [data]);
    
    if (items.length === 0) return '';
    
    // Get all unique keys from all objects
    const allKeys: string[] = Array.from(
      new Set(items.flatMap((item: Record<string, unknown>) => Object.keys(item)))
    );
    
    // Create header row
    const headers = options.includeHeaders 
      ? allKeys.join(delimiter)
      : '';
    
    // Create data rows
    const rows = items.map((item: Record<string, unknown>) => 
      allKeys.map(key => {
        const value = item[key];
        // Handle values with delimiters or quotes
        const stringValue = String(value ?? '');
        if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(delimiter)
    );
    
    return options.includeHeaders 
      ? [headers, ...rows].join('\n')
      : rows.join('\n');
  };

  const handleConvert = async () => {
    if (!inputText.trim()) return;

    setStatus('processing');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      try {
        if (conversionMode === 'csv-to-json') {
          const json = csvToJson(inputText);
          const jsonString = options.prettyPrint 
            ? JSON.stringify(json, null, 2)
            : JSON.stringify(json);
          
          setConvertedData({
            json: jsonString,
            parsed: json,
            lines: inputText.split('\n').length,
            size: new Blob([jsonString]).size
          });
        } else {
          // JSON to CSV
          const csv = jsonToCsv(inputText);
          
          setConvertedData({
            json: csv,
            parsed: csv,
            lines: csv.split('\n').length,
            size: new Blob([csv]).size
          });
        }
        setStatus('success');
      } catch {
        setStatus('error');
      }
    }, 1000);
  };

  const handleDownload = () => {
    if (!convertedData) return;
    
    const fileType = conversionMode === 'csv-to-json' ? 'application/json' : 'text/csv';
    const fileName = conversionMode === 'csv-to-json' ? 'converted.json' : 'converted.csv';
    
    const blob = new Blob([convertedData.json], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (convertedData) {
      navigator.clipboard.writeText(convertedData.json);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const sampleCSV = `name,email,age,city
John Doe,john@example.com,30,New York
Jane Smith,jane@example.com,25,Los Angeles
Bob Johnson,bob@example.com,35,Chicago`;

  const sampleJSON = `[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "city": "New York"
  },
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25,
    "city": "Los Angeles"
  },
  {
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "age": 35,
    "city": "Chicago"
  }
]`;

  const loadSample = () => {
    setInputText(conversionMode === 'csv-to-json' ? sampleCSV : sampleJSON);
    setStatus('idle');
    setConvertedData(null);
  };

  return (
    <ConverterLayout
      title={conversionMode === 'csv-to-json' ? "CSV to JSON Converter" : "JSON to CSV Converter"}
      description={
        conversionMode === 'csv-to-json' 
          ? "Convert CSV data to JSON format instantly. Customize delimiter, headers, and output structure. Perfect for developers and data analysts."
          : "Convert JSON data back to CSV format. Extract data from JSON arrays and objects into CSV files."
      }
      icon={<Code className="w-8 h-8 text-white" />}
      badge="Free"
    >
      {/* Conversion Mode Toggle */}
      <div className="mb-6 flex items-center justify-center">
        <div className="inline-flex items-center bg-white rounded-xl p-1.5 border-2 border-gray-200 shadow-sm">
          <button
            onClick={() => {
              setConversionMode('csv-to-json');
              setInputText('');
              setConvertedData(null);
              setStatus('idle');
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              conversionMode === 'csv-to-json'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            CSV → JSON
          </button>
          <button
            onClick={() => {
              setConversionMode('json-to-csv');
              setInputText('');
              setConvertedData(null);
              setStatus('idle');
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              conversionMode === 'json-to-csv'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code className="w-4 h-4" />
            JSON → CSV
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
                {conversionMode === 'csv-to-json' ? (
                  <FileText className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Code className="w-5 h-5 text-purple-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {conversionMode === 'csv-to-json' ? 'CSV Input' : 'JSON Input'}
                </h3>
              </div>
              <button
                onClick={loadSample}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
              >
                Load Sample
              </button>
            </div>
            
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setStatus('idle');
                  setConvertedData(null);
                }}
                placeholder={
                  conversionMode === 'csv-to-json'
                    ? "Paste your CSV data here...&#10;&#10;name,email,age&#10;John,john@example.com,30&#10;Jane,jane@example.com,25"
                    : 'Paste your JSON data here...&#10;&#10;[&#10;  {"name": "John", "email": "john@example.com", "age": 30},&#10;  {"name": "Jane", "email": "jane@example.com", "age": 25}&#10;]'
                }
                className="w-full min-h-[300px] max-h-[700px] h-[400px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 text-sm font-mono text-gray-900 bg-gray-50 resize-y transition-colors"
              />
            
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>{inputText.split('\n').filter(l => l.trim()).length} lines</span>
              <span>{inputText.length} characters</span>
            </div>
          </div>

            {/* Right: Output Area */}
            <ResultPreview
              status={status}
              result={convertedData}
              progress={progress}
              onDownload={handleDownload}
              onCopy={handleCopy}
              showCopyButton={true}
              renderPreview={(result) => {
                const data = result as ConvertedResult;
                return (
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">Records</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {Array.isArray(data.parsed) ? data.parsed.length : (data.parsed as { count: number }).count}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">Input Lines</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {data.lines}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">Output Size</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatFileSize(data.size)}
                        </p>
                      </div>
                    </div>

                  {/* Output Preview */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      {conversionMode === 'csv-to-json' ? 'JSON Output Preview' : 'CSV Output Preview'}
                    </p>
                    <div className="relative group">
                      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-5 overflow-auto min-h-[280px] max-h-[580px] h-[380px] border-2 border-indigo-100 shadow-inner">
                        <pre className="text-xs font-mono text-indigo-900 leading-relaxed">
                          {data.json}
                        </pre>
                      </div>
                      {/* Copy Button */}
                      <button
                        onClick={handleCopy}
                        className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white border-2 border-indigo-200 hover:border-indigo-400 rounded-lg shadow-md hover:shadow-lg transition-all"
                        title="Copy JSON"
                      >
                        <Copy className="w-4 h-4 text-indigo-600" />
                      </button>
                      
                      {/* Copied notification */}
                      {showCopied && (
                        <div className="absolute top-16 right-3 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-lg animate-bounce">
                          ✓ Copied!
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* Right Column: Settings & Actions (1 column) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Options Panel - Vertical */}
          <div className="sticky top-24">
            <OptionsPanel
              title="Settings"
              options={optionConfigs}
              onChange={handleOptionChange}
            />

            {/* Convert Button */}
            {inputText.trim() && status !== 'processing' && (
              <button
                onClick={handleConvert}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Code className="w-5 h-5" />
                Convert
              </button>
            )}

            {/* Quick Actions */}
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={loadSample}
                  className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded-lg transition-colors border border-gray-200 hover:border-indigo-300"
                >
                  📝 Load Sample Data
                </button>
                <button
                  onClick={() => {
                    setInputText('');
                    setStatus('idle');
                    setConvertedData(null);
                  }}
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
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Any Delimiter</h3>
          <p className="text-sm text-gray-600">
            Support for comma, semicolon, tab, pipe, and custom delimiters
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Code className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Flexible Output</h3>
          <p className="text-sm text-gray-600">
            Choose between array of objects or keyed object format
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Instant Conversion</h3>
          <p className="text-sm text-gray-600">
            Process CSV data in real-time with live preview
          </p>
        </div>
      </div>
    </ConverterLayout>
  );
}

export default function CSVToJSONConverter() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CSVToJSONContent />
    </Suspense>
  );
}

