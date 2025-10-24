'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  FileText, 
  Code, 
  Image, 
  Video, 
  Music,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Grid,
  Search
} from 'react-feather';

// Tool definition interface
interface Tool {
  id: string;
  name: string;
  to: string;
  description: string;
  badge?: string;
  href: string;
  enabled?: boolean;
}

// Tool group definition
interface ToolGroup {
  id: string;
  source: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  tools: Tool[];
}

// Grouped tools by source file type
const toolGroups: ToolGroup[] = [
  {
    id: 'csv',
    source: 'CSV',
    description: 'Convert CSV files to other formats',
    icon: FileText,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    tools: [
      {
        id: 'csv-to-excel',
        name: 'CSV',
        to: 'Excel',
        description: 'Create Excel spreadsheets (.xlsx) with formatting',
        badge: 'New',
        href: '/tools/csv-to-excel',
        enabled: true
      },
      {
        id: 'csv-to-json',
        name: 'CSV',
        to: 'JSON',
        description: 'Transform CSV data into JSON format',
        badge: 'Popular',
        href: '/tools/csv-to-json',
        enabled: true
      },
      {
        id: 'csv-to-html',
        name: 'CSV',
        to: 'HTML Table',
        description: 'Generate HTML tables with custom styling',
        badge: 'New',
        href: '/tools/csv-to-html',
        enabled: true
      },
      {
        id: 'csv-to-markdown',
        name: 'CSV',
        to: 'Markdown',
        description: 'Create Markdown tables for documentation',
        badge: 'New',
        href: '/tools/csv-to-markdown',
        enabled: true
      },
      {
        id: 'csv-to-sql',
        name: 'CSV',
        to: 'SQL',
        description: 'Generate SQL INSERT statements for databases',
        badge: 'New',
        href: '/tools/csv-to-sql',
        enabled: true
      },
      {
        id: 'csv-to-xml',
        name: 'CSV',
        to: 'XML',
        description: 'Convert CSV to XML format',
        href: '/tools/csv-to-xml',
        enabled: false
      },
      {
        id: 'csv-to-yaml',
        name: 'CSV',
        to: 'YAML',
        description: 'Convert CSV to YAML configuration format',
        href: '/tools/csv-to-yaml',
        enabled: false
      },
      {
        id: 'csv-to-pdf',
        name: 'CSV',
        to: 'PDF',
        description: 'Generate formatted PDF tables from CSV',
        href: '/tools/csv-to-pdf',
        enabled: false
      },
      {
        id: 'csv-to-javascript',
        name: 'CSV',
        to: 'JavaScript',
        description: 'Convert to JavaScript array/object format',
        href: '/tools/csv-to-javascript',
        enabled: false
      },
      {
        id: 'csv-to-python',
        name: 'CSV',
        to: 'Python',
        description: 'Generate Python dictionary or list format',
        href: '/tools/csv-to-python',
        enabled: false
      }
    ]
  },
  {
    id: 'json',
    source: 'JSON',
    description: 'JSON formatting and conversion tools',
    icon: Code,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    tools: [
      {
        id: 'json-formatter',
        name: 'JSON',
        to: 'Formatter',
        description: 'Beautify, minify, and validate JSON data',
        href: '/tools/json-formatter',
        enabled: true
      }
    ]
  },
  {
    id: 'excel',
    source: 'Excel',
    description: 'Excel/spreadsheet conversion tools',
    icon: FileText,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    tools: [
      {
        id: 'excel-to-csv',
        name: 'Excel',
        to: 'CSV',
        description: 'Convert Excel spreadsheets to CSV format',
        badge: 'New',
        href: '/tools/csv-to-excel?mode=excel-to-csv',
        enabled: true
      },
      {
        id: 'excel-to-pdf',
        name: 'Excel',
        to: 'PDF',
        description: 'Convert Excel spreadsheets to PDF documents',
        badge: 'New',
        href: '/tools/excel-to-pdf',
        enabled: true
      }
    ]
  },
  {
    id: 'word',
    source: 'Word',
    description: 'Word document conversion tools',
    icon: FileText,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    tools: [
      {
        id: 'word-to-pdf',
        name: 'Word',
        to: 'PDF',
        description: 'Convert Word documents to PDF format',
        badge: 'New',
        href: '/tools/word-to-pdf',
        enabled: true
      }
    ]
  },
  {
    id: 'universal',
    source: 'Universal',
    description: 'Convert any file to any format',
    icon: Grid,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    tools: [
      {
        id: 'universal-converter',
        name: 'Universal',
        to: 'Any Format',
        description: 'Batch convert files between 300+ formats',
        badge: 'Popular',
        href: '/tools/universal-converter',
        enabled: false
      }
    ]
  },
  {
    id: 'pdf',
    source: 'PDF',
    description: 'PDF conversion and manipulation tools',
    icon: FileText,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    tools: [
      {
        id: 'pdf-to-word',
        name: 'PDF',
        to: 'Word',
        description: 'Convert PDF to editable Word documents',
        href: '/tools/pdf-to-word',
        enabled: false
      },
      {
        id: 'pdf-to-image',
        name: 'PDF',
        to: 'Image',
        description: 'Extract images or convert PDF pages to images',
        href: '/tools/pdf-to-image',
        enabled: false
      }
    ]
  },
  {
    id: 'image',
    source: 'Image',
    description: 'Image conversion and optimization tools',
    icon: Image,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    tools: [
      {
        id: 'image-to-pdf',
        name: 'Image',
        to: 'PDF',
        description: 'Combine multiple images into PDF documents',
        badge: 'Popular',
        href: '/tools/image-to-pdf',
        enabled: false
      },
      {
        id: 'image-compressor',
        name: 'Image',
        to: 'Compressed',
        description: 'Reduce image file size without quality loss',
        href: '/tools/image-compressor',
        enabled: false
      }
    ]
  },
  {
    id: 'video',
    source: 'Video',
    description: 'Video conversion and compression tools',
    icon: Video,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    tools: [
      {
        id: 'video-compressor',
        name: 'Video',
        to: 'Compressed',
        description: 'Reduce video file size while maintaining quality',
        href: '/tools/video-compressor',
        enabled: false
      },
      {
        id: 'video-to-gif',
        name: 'Video',
        to: 'GIF',
        description: 'Convert video clips to animated GIFs',
        href: '/tools/video-to-gif',
        enabled: false
      }
    ]
  },
  {
    id: 'audio',
    source: 'Audio',
    description: 'Audio conversion and editing tools',
    icon: Music,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-100',
    tools: [
      {
        id: 'audio-converter',
        name: 'Audio',
        to: 'Any Format',
        description: 'Convert between MP3, WAV, FLAC, and more',
        href: '/tools/audio-converter',
        enabled: false
      }
    ]
  }
];

export default function ToolsPage() {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['csv', 'json', 'excel', 'word']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleGroup = (groupId: string) => {
    if (expandedGroups.includes(groupId)) {
      setExpandedGroups(expandedGroups.filter(id => id !== groupId));
    } else {
      setExpandedGroups([...expandedGroups, groupId]);
    }
  };

  const expandAll = () => {
    setExpandedGroups(toolGroups.map(g => g.id));
  };

  const collapseAll = () => {
    setExpandedGroups([]);
  };

  // Filter tools based on search
  const filteredGroups = toolGroups.map(group => ({
    ...group,
    tools: group.tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.source.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.tools.length > 0);

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <Header />

      <main className="px-8 py-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            All Converter Tools
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Browse our complete collection of conversion tools, organized by source file type for easy discovery.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools... (e.g., CSV, PDF, Image)"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-base text-gray-900 bg-white shadow-md hover:shadow-lg transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={expandAll}
            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Collapse All
          </button>
        </div>

        {/* Tool Groups */}
        <div className="space-y-4">
          {filteredGroups.map((group) => {
            const IconComponent = group.icon;
            const isExpanded = expandedGroups.includes(group.id);
            
            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${group.iconBg} rounded-xl flex items-center justify-center`}>
                      <IconComponent className={`w-7 h-7 ${group.iconColor}`} />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {group.source} Tools
                        <span className="ml-3 text-sm font-normal text-gray-500">
                          ({group.tools.length} {group.tools.length === 1 ? 'tool' : 'tools'})
                        </span>
                      </h2>
                      <p className="text-sm text-gray-600">{group.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Tools List */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {group.tools.map((tool) => {
                        // Disabled tool (Coming Soon)
                        if (tool.enabled === false) {
                          return (
                            <div
                              key={tool.id}
                              className="relative group p-4 border-2 border-gray-100 rounded-xl opacity-60 cursor-not-allowed bg-gray-50"
                            >
                              <div className="absolute top-2 right-2 z-10">
                                <span className="px-2 py-0.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                  Soon
                                </span>
                              </div>
                              <div className="flex flex-col gap-2 filter grayscale">
                                <div className="flex items-start justify-between pr-12">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-base font-bold text-gray-900 whitespace-nowrap">
                                      {tool.name}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="text-base font-bold text-gray-600 whitespace-nowrap">
                                      {tool.to}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 leading-snug">
                                  {tool.description}
                                </p>
                              </div>
                            </div>
                          );
                        }
                        
                        // Enabled tool
                        return (
                          <Link
                            key={tool.id}
                            href={tool.href}
                            className="relative group p-4 border-2 border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                                    {tool.name}
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                                  <span className="text-base font-bold text-indigo-600 whitespace-nowrap">
                                    {tool.to}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-snug">
                                {tool.description}
                              </p>
                              {tool.badge && (
                                <span className={`inline-block w-fit px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${
                                  tool.badge === 'Popular' 
                                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                    : tool.badge === 'New'
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                  {tool.badge}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600">Try a different search term</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-indigo-600 mb-1">
              {toolGroups.reduce((acc, group) => acc + group.tools.length, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Tools</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-purple-600 mb-1">{toolGroups.length}</p>
            <p className="text-sm text-gray-600">File Types</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-green-600 mb-1">Free</p>
            <p className="text-sm text-gray-600">No Limits</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-orange-600 mb-1">Fast</p>
            <p className="text-sm text-gray-600">Instant Convert</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
