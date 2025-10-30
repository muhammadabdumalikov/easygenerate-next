import type { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'About Converto',
  description: 'Learn about Converto — fast, reliable online file conversion tools.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f3ef]">
          <Header />
          
          <main className="px-8 py-12 max-w-6xl mx-auto">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                About Converto
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Coming soon...
              </p>
            </div>
          </main>
        </div>
  );
}

