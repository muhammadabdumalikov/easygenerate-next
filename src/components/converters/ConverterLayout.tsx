'use client';

import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'react-feather';
import Link from 'next/link';

interface ConverterLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  icon?: ReactNode;
  badge?: string;
}

export default function ConverterLayout({
  children,
  title,
  description,
  icon,
  badge
}: ConverterLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-8 pt-6">
        <Link 
          href="/tools"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Tools
        </Link>
      </div>

      {/* Hero Section */}
      <main className="px-8 py-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-10">
          {/* Icon & Badge */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {icon && (
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                {icon}
              </div>
            )}
            {badge && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                {badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Main Content */}
        <div className="mt-8">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}

