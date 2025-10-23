'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeaturesSection from '@/components/FeaturesSection';
import Link from 'next/link';
import { 
  Search, 
  Image, 
  FileText, 
  Code, 
  Video, 
  Music,
  TrendingUp,
  Grid,
  ArrowRight,
  Table
} from 'react-feather';

// Popular tools configuration
const popularTools = [
  {
    id: 'universal-converter',
    name: 'Universal Converter',
    description: 'Convert any file to any format - 300+ formats supported',
    icon: Grid,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    category: 'All',
    href: '/tools/universal-converter'
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert images to PDF documents',
    icon: Image,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    category: 'Image',
    href: '/tools/image-to-pdf'
  },
  {
    id: 'csv-to-json',
    name: 'CSV to JSON',
    description: 'Transform CSV data to JSON format',
    icon: Code,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    category: 'Data',
    href: '/tools/csv-to-json'
  },
  {
    id: 'csv-to-excel',
    name: 'CSV to Excel',
    description: 'Convert CSV files to Excel spreadsheets',
    icon: Table,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    category: 'Data',
    href: '/tools/csv-to-excel'
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF to editable Word docs',
    icon: FileText,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    category: 'Document',
    href: '/tools/pdf-to-word'
  },
  {
    id: 'video-compressor',
    name: 'Video Compressor',
    description: 'Reduce video file size easily',
    icon: Video,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    category: 'Video',
    href: '/tools/video-compressor'
  },
  {
    id: 'audio-converter',
    name: 'Audio Converter',
    description: 'Convert MP3, WAV, FLAC and more',
    icon: Music,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    category: 'Audio',
    href: '/tools/audio-converter'
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Beautify and validate JSON',
    icon: Code,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    category: 'Data',
    href: '/tools/json-formatter'
  }
];

const categories = [
  { id: 'all', name: 'All Tools', count: 50 },
  { id: 'image', name: 'Image', count: 12 },
  { id: 'document', name: 'Document', count: 15 },
  { id: 'data', name: 'Data', count: 8 },
  { id: 'video', name: 'Video', count: 7 },
  { id: 'audio', name: 'Audio', count: 8 }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = popularTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           tool.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <Header />

      {/* Hero Section */}
      <section className="px-8 py-12 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Free Online Converter Tools
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
            Convert, compress, and transform files instantly. 
            <span className="text-indigo-600 font-semibold"> 50+ professional tools</span>, 
            no registration required.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools... (e.g., PDF, Image, JSON)"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-gray-900 bg-white shadow-lg hover:shadow-xl transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                {category.name}
                <span className="ml-1.5 text-xs opacity-70">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Tools Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                {searchQuery ? `Search Results (${filteredTools.length})` : 'Popular Tools'}
              </h2>
            </div>
            <Link 
              href="/tools"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1 group"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Tool Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${tool.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-6 h-6 ${tool.iconColor}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {tool.description}
                      </p>
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2">No tools found</p>
              <p className="text-gray-500 text-sm">Try a different search term or category</p>
            </div>
          )}
        </div>

        {/* Browse All CTA */}
        <div className="text-center mb-16">
          <Link
            href="/tools"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-2xl group"
          >
            <Grid className="w-6 h-6" />
            Browse All 50+ Tools
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-indigo-600 mb-1">50+</p>
            <p className="text-sm text-gray-600">Tools Available</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-purple-600 mb-1">300+</p>
            <p className="text-sm text-gray-600">File Formats</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-green-600 mb-1">10M+</p>
            <p className="text-sm text-gray-600">Conversions</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-orange-600 mb-1">Free</p>
            <p className="text-sm text-gray-600">No Limits</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      <Footer />
    </div>
  );
}
