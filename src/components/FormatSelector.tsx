'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, TrendingUp } from 'react-feather';

interface FormatOption {
    value: string;
    label: string;
    category: string;
}

interface FormatSelectorProps {
    value: string | null;
    onChange: (value: string) => void;
    onClose: () => void;
    isOpen: boolean;
}

// Popular formats for quick access
const popularFormats = ['pdf', 'jpg', 'png', 'mp4', 'mp3', 'docx', 'xlsx', 'zip'];

const formatCategories = [
    { id: 'image', label: 'Image', icon: '🖼️', color: 'from-blue-500 to-cyan-500' },
    { id: 'document', label: 'Document', icon: '📄', color: 'from-red-500 to-orange-500' },
    { id: 'video', label: 'Video', icon: '🎥', color: 'from-purple-500 to-pink-500' },
    { id: 'audio', label: 'Audio', icon: '🎵', color: 'from-green-500 to-emerald-500' },
    { id: 'archive', label: 'Archive', icon: '📦', color: 'from-yellow-500 to-orange-500' },
    { id: 'presentation', label: 'Presentation', icon: '📊', color: 'from-indigo-500 to-purple-500' },
    { id: 'spreadsheet', label: 'Spreadsheet', icon: '📈', color: 'from-teal-500 to-cyan-500' },
    { id: 'vector', label: 'Vector', icon: '🎨', color: 'from-pink-500 to-rose-500' },
];

const formatOptions: FormatOption[] = [
    // Image formats
    { value: 'jpg', label: 'JPG', category: 'image' },
    { value: 'png', label: 'PNG', category: 'image' },
    { value: 'gif', label: 'GIF', category: 'image' },
    { value: 'svg', label: 'SVG', category: 'image' },
    { value: 'webp', label: 'WEBP', category: 'image' },
    { value: 'bmp', label: 'BMP', category: 'image' },
    { value: 'tiff', label: 'TIFF', category: 'image' },
    { value: 'ico', label: 'ICO', category: 'image' },
    { value: 'psd', label: 'PSD', category: 'image' },
    { value: 'raw', label: 'RAW', category: 'image' },

    // Document formats
    { value: 'pdf', label: 'PDF', category: 'document' },
    { value: 'doc', label: 'DOC', category: 'document' },
    { value: 'docx', label: 'DOCX', category: 'document' },
    { value: 'txt', label: 'TXT', category: 'document' },
    { value: 'rtf', label: 'RTF', category: 'document' },
    { value: 'odt', label: 'ODT', category: 'document' },
    { value: 'html', label: 'HTML', category: 'document' },
    { value: 'xml', label: 'XML', category: 'document' },

    // Video formats
    { value: 'mp4', label: 'MP4', category: 'video' },
    { value: 'avi', label: 'AVI', category: 'video' },
    { value: 'mov', label: 'MOV', category: 'video' },
    { value: 'wmv', label: 'WMV', category: 'video' },
    { value: 'flv', label: 'FLV', category: 'video' },
    { value: 'webm', label: 'WEBM', category: 'video' },
    { value: 'mkv', label: 'MKV', category: 'video' },
    { value: 'm4v', label: 'M4V', category: 'video' },

    // Audio formats
    { value: 'mp3', label: 'MP3', category: 'audio' },
    { value: 'wav', label: 'WAV', category: 'audio' },
    { value: 'flac', label: 'FLAC', category: 'audio' },
    { value: 'aac', label: 'AAC', category: 'audio' },
    { value: 'ogg', label: 'OGG', category: 'audio' },
    { value: 'wma', label: 'WMA', category: 'audio' },
    { value: 'm4a', label: 'M4A', category: 'audio' },

    // Archive formats
    { value: 'zip', label: 'ZIP', category: 'archive' },
    { value: 'rar', label: 'RAR', category: 'archive' },
    { value: '7z', label: '7Z', category: 'archive' },
    { value: 'tar', label: 'TAR', category: 'archive' },
    { value: 'gz', label: 'GZ', category: 'archive' },

    // Presentation formats
    { value: 'ppt', label: 'PPT', category: 'presentation' },
    { value: 'pptx', label: 'PPTX', category: 'presentation' },
    { value: 'odp', label: 'ODP', category: 'presentation' },
    { value: 'key', label: 'KEY', category: 'presentation' },

    // Spreadsheet formats
    { value: 'xls', label: 'XLS', category: 'spreadsheet' },
    { value: 'xlsx', label: 'XLSX', category: 'spreadsheet' },
    { value: 'csv', label: 'CSV', category: 'spreadsheet' },
    { value: 'ods', label: 'ODS', category: 'spreadsheet' },
    { value: 'numbers', label: 'NUMBERS', category: 'spreadsheet' },

    // Vector formats
    { value: 'ai', label: 'AI', category: 'vector' },
    { value: 'eps', label: 'EPS', category: 'vector' },
    { value: 'sketch', label: 'SKETCH', category: 'vector' },
    { value: 'figma', label: 'FIGMA', category: 'vector' },
];

export default function FormatSelector({ value, onChange, onClose, isOpen }: FormatSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Prevent body scroll when modal is open
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '0px';
            
            // Focus search input when modal opens
            setTimeout(() => searchInputRef.current?.focus(), 100);
            
            return () => {
                // Restore original styles
                document.body.style.overflow = originalStyle;
                document.body.style.paddingRight = '';
            };
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setSearchTerm('');
                setSelectedCategory(null);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isOpen, onClose]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, []);

    const filteredFormats = formatOptions.filter(format => {
        const matchesSearch = format.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             format.value.toLowerCase().includes(searchTerm.toLowerCase());
        
        // If there's a search term, show results from all categories
        if (searchTerm.trim()) {
            return matchesSearch;
        }
        
        // If category is selected, filter by it
        if (selectedCategory) {
            return format.category === selectedCategory;
        }
        
        // Otherwise show all formats
        return true;
    });

    const handleFormatSelect = (formatValue: string) => {
        onChange(formatValue);
        onClose();
    };

    const getCategoryInfo = (categoryId: string) => {
        return formatCategories.find(cat => cat.id === categoryId);
    };

    if (!isVisible) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm p-4 pt-8"
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
        >
            <div
                ref={panelRef}
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all duration-300 ${
                    isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
                style={{ maxHeight: 'calc(100vh - 4rem)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Select Format</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Choose from 300+ supported formats</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search formats (e.g., PDF, JPG, MP4)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 placeholder-gray-400 transition-all"
                        />
                    </div>
                </div>

                <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem - 140px)' }}>
                    {/* Popular Formats Section (only show when no search or category) */}
                    {!searchTerm && !selectedCategory && (
                        <div className="mb-5">
                            <div className="flex items-center gap-1.5 mb-2.5">
                                <TrendingUp className="w-4 h-4 text-indigo-600" />
                                <h4 className="text-sm font-semibold text-gray-900">Popular</h4>
                            </div>
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                                {popularFormats.map((formatValue) => {
                                    const format = formatOptions.find(f => f.value === formatValue);
                                    if (!format) return null;
                                    return (
                                        <button
                                            key={format.value}
                                            onClick={() => handleFormatSelect(format.value)}
                                            className={`py-2.5 px-3 rounded-lg border-2 transition-all text-center text-sm font-bold hover:scale-105 ${
                                                value === format.value
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                    : 'bg-gradient-to-br from-gray-50 to-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:shadow-sm'
                                            }`}
                                        >
                                            {format.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Category Chips */}
                    {!searchTerm && (
                        <div className="mb-4">
                            <h4 className="text-xs font-medium text-gray-500 mb-2">Browse by category</h4>
                            <div className="flex flex-wrap gap-1.5">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                        selectedCategory === null
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    All
                                </button>
                                {formatCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                                            selectedCategory === category.id
                                                ? `bg-gradient-to-r ${category.color} text-white shadow-sm`
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <span className="text-sm">{category.icon}</span>
                                        <span>{category.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Format Grid */}
                    <div>
                        {searchTerm && (
                            <h4 className="text-xs font-medium text-gray-500 mb-2.5">
                                {filteredFormats.length} result{filteredFormats.length !== 1 ? 's' : ''}
                            </h4>
                        )}
                        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                            {filteredFormats.map((format) => {
                                const categoryInfo = getCategoryInfo(format.category);
                                return (
                                    <button
                                        key={format.value}
                                        onClick={() => handleFormatSelect(format.value)}
                                        className={`group relative py-2.5 px-3 rounded-lg border-2 transition-all text-center text-sm font-bold hover:scale-105 ${
                                            value === format.value
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:shadow-sm'
                                        }`}
                                        title={`${format.label} (${categoryInfo?.label})`}
                                    >
                                        {format.label}
                                        {searchTerm && categoryInfo && (
                                            <span className="absolute -top-1 -right-1 text-xs bg-gray-900 text-white px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                {categoryInfo.icon}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {filteredFormats.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Search className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-base font-medium text-gray-900 mb-1">No formats found</p>
                                <p className="text-xs text-gray-500">
                                    Try a different search term or browse by category
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
