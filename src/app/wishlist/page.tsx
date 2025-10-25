'use client';

import { useState } from 'react';
import { ExternalLink, Gift, Globe } from 'react-feather';

// Translations
const translations = {
  en: {
    title: 'Product list which you can gift to me',
    description: 'Thanks for considering! Here are some items I\'d love to receive. Click on any product to view more details and purchase options.',
    viewProduct: 'View Product',
    footerNote: '💝 These are just suggestions! Any gift or even just your kind thoughts are greatly appreciated. Thank you for being so thoughtful!'
  },
  ru: {
    title: 'Список продуктов, которые вы можете мне подарить',
    description: 'Спасибо, что рассмотрели! Вот некоторые предметы, которые мне бы хотелось получить. Нажмите на любой продукт, чтобы просмотреть подробности и варианты покупки.',
    viewProduct: 'Просмотр продукта',
    footerNote: '💝 Это всего лишь предложения! Любой подарок или даже просто ваши добрые мысли очень ценятся. Спасибо, что вы такие внимательные!'
  },
  uz: {
    title: 'Menga sovg\'a qila oladigan mahsulotlar ro\'yxati',
    description: 'Ko\'rib chiqganingiz uchun rahmat! Quyida menga juda yoqadigan ba\'zi narsalar. Batafsil ma\'lumot va xarid qilish variantlarini ko\'rish uchun har qanday mahsulotni bosing.',
    viewProduct: 'Mahsulotni ko\'rish',
    footerNote: '💝 Bu faqat takliflar! Har qanday sovg\'a yoki hatto faqat sizning mehribon fikrlaringiz juda qadrlanadi. Sizga minnatdorman!'
  }
};

// Product wishlist data
const wishlistProducts = [
  {
    id: 1,
    title: 'Sony WH-1000XM5 Wireless Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=500&fit=crop',
    productUrl: 'https://www.amazon.com/Sony-WH-1000XM5-Canceling-Headphones-Hands-Free/dp/B09XS7JWHH'
  },
  {
    id: 2,
    title: 'Kindle Paperwhite E-Reader',
    imageUrl: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500&h=500&fit=crop',
    productUrl: 'https://www.amazon.com/Kindle-Paperwhite-adjustable-Ad-Supported/dp/B08KTZ8249'
  },
  {
    id: 3,
    title: 'Mechanical Keyboard - Keychron K8',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
    productUrl: 'https://www.keychron.com/products/keychron-k8-tenkeyless-wireless-mechanical-keyboard'
  },
  {
    id: 4,
    title: 'Apple AirPods Pro (2nd Generation)',
    imageUrl: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500&h=500&fit=crop',
    productUrl: 'https://www.apple.com/airpods-pro/'
  },
  {
    id: 5,
    title: 'Logitech MX Master 3S Mouse',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
    productUrl: 'https://www.logitech.com/en-us/products/mice/mx-master-3s.html'
  },
  {
    id: 6,
    title: 'Samsung T7 Portable SSD 1TB',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop',
    productUrl: 'https://www.samsung.com/us/computing/memory-storage/portable-solid-state-drives/portable-ssd-t7-1tb-indigo-blue-mu-pc1t0h-ww/'
  }
];

export default function WishlistPage() {
  const [currentLang, setCurrentLang] = useState<'en' | 'ru' | 'uz'>('ru');
  const t = translations[currentLang];

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <main className="px-8 py-12 max-w-7xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end mb-6">
          <div className="bg-white rounded-xl p-1 border-2 border-gray-200 flex gap-1">
            <button
              onClick={() => setCurrentLang('en')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentLang === 'en'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setCurrentLang('ru')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentLang === 'ru'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setCurrentLang('uz')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentLang === 'uz'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              UZ
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {t.title}
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 min-h-[3.5rem] line-clamp-2">
                  {product.title}
                </h3>

                {/* View Product Link */}
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg group/btn"
                >
                  {t.viewProduct}
                  <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-2xl mx-auto">
            <p className="text-gray-600 text-sm">
              {t.footerNote}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

