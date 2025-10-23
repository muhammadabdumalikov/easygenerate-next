/**
 * Shared TypeScript types for the Converter Tools System
 */

// Conversion status types
export type ConversionStatus = 'idle' | 'processing' | 'success' | 'error';

// Uploaded file interface
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File;
  preview?: string;
  url?: string;
}

// Option configuration types
export type OptionType = 'select' | 'toggle' | 'slider' | 'input';

export interface SelectOption {
  value: string;
  label: string;
}

export interface OptionConfig {
  id: string;
  label: string;
  type: OptionType;
  value: string | number | boolean;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
}

// Converter tool metadata
export interface ConverterTool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  category: ConverterCategory;
  badge?: string;
  href: string;
  popular?: boolean;
  tags?: string[];
}

export type ConverterCategory = 
  | 'Image' 
  | 'Document' 
  | 'Data' 
  | 'Video' 
  | 'Audio' 
  | 'Utility'
  | 'All';

// Conversion result
export interface ConversionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  fileName?: string;
  fileSize?: number;
  downloadUrl?: string;
  metadata?: Record<string, unknown>;
}

// Progress callback type
export type ProgressCallback = (progress: number) => void;

// Converter function type
export type ConverterFunction = (
  input: UploadedFile | string,
  options: Record<string, unknown>,
  onProgress?: ProgressCallback
) => Promise<ConversionResult>;

