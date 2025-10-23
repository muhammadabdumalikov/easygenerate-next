import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  Image, 
  FileText, 
  Code, 
  Video, 
  Music, 
  Archive,
  Type,
  Database,
  Layout,
  ArrowRight,
  Grid
} from 'react-feather';

// Converter tool configuration
interface ConverterTool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  category: string;
  badge?: string;
  href: string;
  popular?: boolean;
}

const converterTools: ConverterTool[] = [
  {
    id: 'universal-converter',
    name: 'Universal File Converter',
    description: 'Convert any file to any format. Batch processing, 300+ formats supported',
    icon: Grid,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    category: 'All',
    badge: 'Popular',
    href: '/tools/universal-converter',
    popular: true
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert JPG, PNG, GIF images to PDF documents with custom settings',
    icon: Image,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    category: 'Image',
    badge: 'Popular',
    href: '/tools/image-to-pdf',
    popular: true
  },
  {
    id: 'csv-to-json',
    name: 'CSV to JSON',
    description: 'Transform CSV data into JSON format with flexible options',
    icon: Code,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    category: 'Data',
    badge: 'Free',
    href: '/tools/csv-to-json',
    popular: true
  },
  {
    id: 'csv-to-excel',
    name: 'CSV to Excel',
    description: 'Convert CSV files to Excel spreadsheets (.xlsx) with formatting',
    icon: Database,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    category: 'Data',
    badge: 'New',
    href: '/tools/csv-to-excel',
    popular: true
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files',
    icon: FileText,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    category: 'Document',
    href: '/tools/pdf-to-word'
  },
  {
    id: 'video-compressor',
    name: 'Video Compressor',
    description: 'Reduce video file size while maintaining quality',
    icon: Video,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    category: 'Video',
    href: '/tools/video-compressor'
  },
  {
    id: 'audio-converter',
    name: 'Audio Converter',
    description: 'Convert between MP3, WAV, FLAC, and other audio formats',
    icon: Music,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    category: 'Audio',
    href: '/tools/audio-converter'
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Beautify and validate JSON data with syntax highlighting',
    icon: Database,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    category: 'Data',
    badge: 'New',
    href: '/tools/json-formatter'
  },
  {
    id: 'markdown-to-html',
    name: 'Markdown to HTML',
    description: 'Convert Markdown documents to HTML with preview',
    icon: Type,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-100',
    category: 'Document',
    href: '/tools/markdown-to-html'
  },
  {
    id: 'file-merger',
    name: 'File Merger',
    description: 'Combine multiple files into a single document',
    icon: Archive,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    category: 'Utility',
    href: '/tools/file-merger'
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Create customizable QR codes for URLs, text, and more',
    icon: Layout,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-100',
    category: 'Utility',
    badge: 'Popular',
    href: '/tools/qr-generator',
    popular: true
  }
];

const categories = ['All', 'Image', 'Document', 'Data', 'Video', 'Audio', 'Utility'];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <Header />

      {/* Hero Section */}
      <section className="px-8 py-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Converter Tools
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Professional conversion tools for all your needs. Fast, secure, and easy to use. 
            No registration required.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
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

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === 'All'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Popular Tools Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Popular Tools</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {converterTools.filter(tool => tool.popular).map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${tool.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-6 h-6 ${tool.iconColor}`} />
                    </div>
                    {tool.badge && (
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {tool.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {tool.category}
                    </span>
                    <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* All Tools Grid */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">All Tools</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {converterTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group bg-white rounded-xl p-5 border border-gray-100 hover:border-indigo-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${tool.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-5 h-5 ${tool.iconColor}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                          {tool.name}
                        </h3>
                        {tool.badge && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded flex-shrink-0">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                    
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Converter?</h2>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            Can&apos;t find the tool you need? Let us know and we&apos;ll build it for you. 
            We&apos;re constantly adding new converters based on user requests.
          </p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all">
            Request a Tool
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

