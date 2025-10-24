import Link from 'next/link';
import { Cloud, Star } from 'react-feather';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full py-4 px-8 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
            Cloudify
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
          >
            Home
          </Link>
          <span 
            className="text-gray-400 cursor-not-allowed font-medium"
          >
            APIs
          </span>
          <Link 
            href="/pricings" 
            className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
          >
            Pricings
          </Link>
          <Link 
            href="/about" 
            className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
          >
            About
          </Link>
        </nav>

        {/* CTA Button */}
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2">
          <Star className="w-4 h-4" />
          Go Premium
        </button>
      </div>
    </header>
  );
}

