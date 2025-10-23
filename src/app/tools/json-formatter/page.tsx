'use client';

import { useState } from 'react';
import ConverterLayout from '@/components/converters/ConverterLayout';
import { Code, FileText, CheckCircle, XCircle, Copy, Download } from 'react-feather';

type FormatMode = 'beautify' | 'minify' | 'validate';
type IndentSize = 2 | 4;

interface ValidationError {
  line?: number;
  message: string;
}

export default function JSONFormatter() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [formatMode, setFormatMode] = useState<FormatMode>('beautify');
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [error, setError] = useState<ValidationError | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showCopied, setShowCopied] = useState(false);

  const formatJSON = () => {
    setError(null);
    setIsValid(null);

    if (!inputText.trim()) {
      setError({ message: 'Please enter some JSON data' });
      setOutputText('');
      return;
    }

    try {
      // Parse JSON
      const parsed = JSON.parse(inputText);
      setIsValid(true);

      // Sort keys if enabled
      const data = sortKeys ? sortObjectKeys(parsed) : parsed;

      // Format based on mode
      let formatted = '';
      switch (formatMode) {
        case 'beautify':
          formatted = JSON.stringify(data, null, indentSize);
          break;
        case 'minify':
          formatted = JSON.stringify(data);
          break;
        case 'validate':
          formatted = '✅ Valid JSON!\n\n' + JSON.stringify(data, null, 2);
          break;
      }

      setOutputText(formatted);
    } catch (err) {
      setIsValid(false);
      const error = err as Error;
      const errorMessage = error.message;
      
      // Try to extract line number from error
      const lineMatch = errorMessage.match(/position (\d+)/);
      const position = lineMatch ? parseInt(lineMatch[1]) : null;
      
      let line: number | undefined;
      if (position !== null) {
        line = inputText.substring(0, position).split('\n').length;
      }

      setError({
        line,
        message: errorMessage
      });
      setOutputText('');
    }
  };

  const sortObjectKeys = (obj: unknown): unknown => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
          result[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
          return result;
        }, {} as Record<string, unknown>);
    }
    return obj;
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (outputText) {
      const blob = new Blob([outputText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formatted-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const loadSample = () => {
    const sample = `{"name":"John Doe","age":30,"email":"john@example.com","address":{"street":"123 Main St","city":"New York","country":"USA"},"hobbies":["reading","coding","travel"],"active":true}`;
    setInputText(sample);
    setOutputText('');
    setError(null);
    setIsValid(null);
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError(null);
    setIsValid(null);
  };

  return (
    <ConverterLayout
      title="JSON Formatter & Validator"
      description="Beautify, minify, validate, and format JSON data. Perfect for developers working with APIs, configuration files, and data structures."
      icon={<Code className="w-8 h-8 text-white" />}
      badge="Free"
    >
      {/* Format Mode Toggle */}
      <div className="mb-6 flex items-center justify-center">
        <div className="inline-flex items-center bg-white rounded-xl p-1.5 border-2 border-gray-200 shadow-sm">
          <button
            onClick={() => setFormatMode('beautify')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              formatMode === 'beautify'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Beautify
          </button>
          <button
            onClick={() => setFormatMode('minify')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              formatMode === 'minify'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code className="w-4 h-4" />
            Minify
          </button>
          <button
            onClick={() => setFormatMode('validate')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              formatMode === 'validate'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Validate
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
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">JSON Input</h3>
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
                  setOutputText('');
                  setError(null);
                  setIsValid(null);
                }}
                placeholder='Paste your JSON here...&#10;&#10;{"name": "John", "age": 30}'
                className="w-full min-h-[300px] max-h-[700px] h-[400px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 text-sm font-mono text-gray-900 bg-gray-50 resize-y transition-colors"
              />
              
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{inputText.split('\n').length} lines</span>
                <span>{inputText.length} characters</span>
              </div>

              {/* Validation Status */}
              {isValid !== null && (
                <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
                  isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  {isValid ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">Valid JSON</p>
                        <p className="text-xs text-green-600 mt-1">Your JSON is properly formatted</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">Invalid JSON</p>
                        {error && (
                          <p className="text-xs text-red-600 mt-1">
                            {error.line && `Line ${error.line}: `}{error.message}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right: Output Area */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Formatted Output</h3>
                </div>
                {outputText && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 bg-gray-100 hover:bg-green-50 text-gray-700 hover:text-green-600 rounded-lg transition-colors"
                      title="Download JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="relative group">
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-5 overflow-auto min-h-[300px] max-h-[700px] h-[400px] border-2 border-indigo-100 shadow-inner">
                  {outputText ? (
                    <pre className="text-xs font-mono text-indigo-900 whitespace-pre leading-relaxed">
                      {outputText}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Code className="w-8 h-8 text-indigo-400" />
                        </div>
                        <p className="text-gray-600 text-sm">Your formatted result will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Copy Button - shows on hover when output exists */}
                {outputText && (
                  <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white border-2 border-indigo-200 hover:border-indigo-400 rounded-lg shadow-md hover:shadow-lg transition-all"
                    title="Copy JSON"
                  >
                    <Copy className="w-4 h-4 text-indigo-600" />
                  </button>
                )}
                
                {/* Copied notification */}
                {showCopied && (
                  <div className="absolute top-16 right-3 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-lg animate-bounce">
                    ✓ Copied!
                  </div>
                )}
              </div>

              {outputText && (
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{outputText.split('\n').length} lines</span>
                  <span>{outputText.length} characters</span>
                </div>
              )}
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
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Settings</h3>
              </div>

              {/* Options */}
              <div className="space-y-5">
                {/* Indent Size - Only show for beautify mode */}
                {formatMode === 'beautify' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-800">Indent Size</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setIndentSize(2)}
                        className={`px-3 py-2 text-sm rounded-lg transition-all ${
                          indentSize === 2
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-300 font-semibold'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-200'
                        }`}
                      >
                        2 spaces
                      </button>
                      <button
                        onClick={() => setIndentSize(4)}
                        className={`px-3 py-2 text-sm rounded-lg transition-all ${
                          indentSize === 4
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-300 font-semibold'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-200'
                        }`}
                      >
                        4 spaces
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Indentation for beautified JSON</p>
                  </div>
                )}

                {/* Sort Keys */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-800">Sort Keys</label>
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sortKeys}
                        onChange={(e) => setSortKeys(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-indigo-600 group-hover:peer-checked:from-indigo-600 group-hover:peer-checked:to-indigo-700 transition-all duration-200"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Alphabetically sort object keys</p>
                </div>
              </div>
            </div>

            {/* Format Button */}
            {inputText.trim() && (
              <button
                onClick={formatJSON}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Code className="w-5 h-5" />
                Format JSON
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
                  📝 Load Sample
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
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Beautify
          </h3>
          <p className="text-sm text-gray-600">
            Format JSON with proper indentation for easy reading and debugging.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Validate
          </h3>
          <p className="text-sm text-gray-600">
            Check if your JSON is valid with detailed error messages and line numbers.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🗜️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Minify
          </h3>
          <p className="text-sm text-gray-600">
            Compress JSON by removing whitespace for production use.
          </p>
        </div>
      </div>
    </ConverterLayout>
  );
}

