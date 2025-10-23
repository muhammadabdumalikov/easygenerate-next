'use client';

import { Settings, ChevronDown } from 'react-feather';

export interface OptionConfig {
  id: string;
  label: string;
  type: 'select' | 'toggle' | 'slider' | 'input';
  value: string | number | boolean;
  options?: { value: string; label: string; icon?: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
}

interface OptionsPanelProps {
  title?: string;
  options: OptionConfig[];
  onChange: (id: string, value: string | number | boolean) => void;
  className?: string;
}

export default function OptionsPanel({ 
  title = 'Conversion Options',
  options, 
  onChange,
  className = ''
}: OptionsPanelProps) {
  
  const renderOption = (option: OptionConfig) => {
    switch (option.type) {
      case 'select':
        return (
          <div className="relative">
            <select
              value={String(option.value)}
              onChange={(e) => onChange(option.id, e.target.value)}
              className="w-full pl-3 pr-8 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-medium text-gray-900 bg-white hover:bg-gray-50 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md"
            >
              {option.options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon ? `${opt.icon} ${opt.label}` : opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );
      
      case 'toggle':
        return (
          <label className="relative inline-flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={Boolean(option.value)}
              onChange={(e) => onChange(option.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-indigo-600 group-hover:peer-checked:from-indigo-600 group-hover:peer-checked:to-indigo-700 transition-all duration-200"></div>
          </label>
        );
      
      case 'slider':
        return (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="range"
                min={option.min}
                max={option.max}
                step={option.step}
                value={Number(option.value)}
                onChange={(e) => onChange(option.id, parseFloat(e.target.value))}
                className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
                style={{
                  background: `linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(99, 102, 241) ${((Number(option.value) - (option.min || 0)) / ((option.max || 100) - (option.min || 0))) * 100}%, rgb(229, 231, 235) ${((Number(option.value) - (option.min || 0)) / ((option.max || 100) - (option.min || 0))) * 100}%, rgb(229, 231, 235) 100%)`
                }}
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">{option.min}</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold rounded-lg text-sm">
                {option.value}
              </span>
              <span className="text-gray-500 font-medium">{option.max}</span>
            </div>
          </div>
        );
      
      case 'input':
        return (
          <input
            type="text"
            value={String(option.value)}
            onChange={(e) => onChange(option.id, e.target.value)}
            placeholder={option.placeholder}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-medium text-gray-900 bg-white hover:bg-gray-50 transition-all placeholder:text-gray-400 shadow-sm hover:shadow-md"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-200">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>

      {/* Options List - Vertical Stack */}
      <div className="space-y-5">
        {options.map(option => (
          <div key={option.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-800">
                {option.label}
              </label>
              {option.type === 'toggle' && renderOption(option)}
            </div>
            
            {option.type !== 'toggle' && (
              <div>
                {renderOption(option)}
              </div>
            )}
            
            {option.description && (
              <p className="text-xs text-gray-500 leading-relaxed">{option.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

