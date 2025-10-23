'use client';

import Link from 'next/link';
import { Globe } from 'react-feather';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [convertedFiles, setConvertedFiles] = useState(3191036609);

  // Animate the counter on mount
  useEffect(() => {
    const interval = setInterval(() => {
      setConvertedFiles(prev => prev + Math.floor(Math.random() * 5) + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2);
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Converted Files Counter */}
        <div className="mb-16 text-center">
          <p className="text-sm text-gray-400 mb-4">Converted Files:</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="font-mono text-4xl md:text-5xl font-bold text-white tracking-wider">
              {formatNumber(convertedFiles)}
            </div>
            <span className="text-xl text-gray-500">/</span>
            <div className="text-2xl text-indigo-400 font-semibold">
              {formatBytes(convertedFiles * 18)} TB
            </div>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Company */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                  About
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/formats" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                  Formats
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                  Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Tools */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Tools</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/video-converter" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                  Video Converter
                </Link>
              </li>
              <li>
                <Link href="/audio-converter" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                  Audio Converter
                </Link>
              </li>
              <li>
                <Link href="/document-converter" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                  Document Converter
                </Link>
              </li>
              <li>
                <Link href="/image-converter" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                  Image Converter
                </Link>
              </li>
              <li>
                <Link href="/ocr" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                  OCR
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Developers */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Developers</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/api" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                  API
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                  API Docs
                </Link>
              </li>
              <li>
                <Link href="/cli-docs" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                  CLI Docs
                </Link>
              </li>
              <li>
                <Link href="/api-pricing" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                  API Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About Cloudify */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">About Cloudify</h3>
            <p className="text-gray-400 leading-relaxed text-sm mb-4">
              Fast and reliable file converter for all your needs. Supporting 300+ formats with cloud-based processing.
            </p>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-700 hover:bg-indigo-600 flex items-center justify-center transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-700 hover:bg-indigo-600 flex items-center justify-center transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-700 hover:bg-indigo-600 flex items-center justify-center transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span>© 2014-2025 Cloudify Ltd. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <Link href="/terms" className="hover:text-indigo-400 transition-colors">
              Terms of Use
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
              Privacy Policy
            </Link>
          </div>

          {/* Language Selector */}
          <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors">
            <Globe className="w-4 h-4" />
            <span>English</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
