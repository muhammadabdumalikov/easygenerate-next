'use client';

import { useState } from 'react';
import { FileText, Code } from 'react-feather';
import ConverterLayout from '@/components/converters/ConverterLayout';
import OptionsPanel, { OptionConfig } from '@/components/converters/OptionsPanel';
import ResultPreview, { ConversionStatus } from '@/components/converters/ResultPreview';

interface ConvertedResult {
  json: string;
  parsed: unknown;
  lines: number;
  size: number;
}

export default function CSVToJSONConverter() {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [convertedData, setConvertedData] = useState<ConvertedResult | null>(null);
  const [options, setOptions] = useState({
    delimiter: 'comma',
    includeHeaders: true,
    prettyPrint: true,
    arrayFormat: 'nested',
    skipEmptyLines: true
  });

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
        setStatus('success');
      } catch {
        setStatus('error');
      }
    }, 1000);
  };

  const handleDownload = () => {
    if (!convertedData) return;
    
    const blob = new Blob([convertedData.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (convertedData) {
      navigator.clipboard.writeText(convertedData.json);
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

  const loadSample = () => {
    setInputText(sampleCSV);
    setStatus('idle');
    setConvertedData(null);
  };

  return (
    <ConverterLayout
      title="CSV to JSON Converter"
      description="Convert CSV data to JSON format instantly. Customize delimiter, headers, and output structure. Perfect for developers and data analysts."
      icon={<Code className="w-8 h-8 text-white" />}
      badge="Free"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Input & Output (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Input & Output Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Area */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">CSV Input</h3>
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
              placeholder="Paste your CSV data here...&#10;&#10;name,email,age&#10;John,john@example.com,30&#10;Jane,jane@example.com,25"
              className="w-full h-[700px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 text-sm font-mono text-gray-900 bg-gray-50 resize-none transition-colors"
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

                  {/* JSON Preview */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">JSON Output Preview:</p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-auto h-[580px]">
                      <pre className="text-xs text-green-400 font-mono">
                        {data.json}
                      </pre>
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

