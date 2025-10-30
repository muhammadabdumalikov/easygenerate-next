import Link from 'next/link';
import { Cloud, Star } from 'react-feather';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full py-3 px-4 md:py-4 md:px-8 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg md:text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors truncate max-w-[50vw] md:max-w-none">
            Converto
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
            <span
              className="text-gray-400 cursor-not-allowed font-medium"
            >
              Pricing
            </span>          </Link>
          <Link
            href="/about"
            className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
          >
            <span
              className="text-gray-400 cursor-not-allowed font-medium"
            >
              About
            </span>          </Link>
        </nav>

        {/* CTA Button */}
        <div className="flex items-center">
          {/* Compact icon button on small screens */}
          <button className="inline-flex sm:hidden items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg">
            <Star className="w-4 h-4" />
          </button>
          {/* Full button from small screens and up */}
          <button className="hidden sm:inline-flex bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg items-center gap-2">
            <Star className="w-4 h-4" />
            Go Premium
          </button>
        </div>
      </div>
    </header>
  );
}

