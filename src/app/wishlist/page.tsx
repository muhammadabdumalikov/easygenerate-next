'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Gift } from 'react-feather';

// Translations
const translations = {
  en: {
    title: 'List of things which you can gift to me',
    description: 'Thanks for considering! Here are some items I\'d love to receive. Click on any product to view more details and purchase options.',
    viewProduct: 'View Product',
    footerNote: '💝 These are just suggestions! Any gift or even just your kind thoughts are greatly appreciated. Thank you for being so thoughtful!'
  },
  ru: {
    title: 'Список вещей, которые вы можете мне подарить',
    description: 'Спасибо, что рассмотрели! Вот некоторые предметы, которые мне бы хотелось получить. Нажмите на любой продукт, чтобы просмотреть подробности и варианты покупки.',
    viewProduct: 'Просмотр продукта',
    footerNote: '💝 Это всего лишь предложения! Любой подарок или даже просто ваши добрые мысли очень ценятся. Спасибо, что вы такие внимательные!'
  },
  uz: {
    title: 'Menga sovg\'a qila oladigan narsalar ro\'yxati',
    description: 'Ko\'rib chiqganingiz uchun rahmat! Quyida menga juda yoqadigan ba\'zi narsalar. Batafsil ma\'lumot va xarid qilish variantlarini ko\'rish uchun har qanday mahsulotni bosing.',
    viewProduct: 'Mahsulotni ko\'rish',
    footerNote: '💝 Bu faqat takliflar! Har qanday sovg\'a yoki hatto faqat sizning mehribon fikrlaringiz juda qadrlanadi. Sizga minnatdorman!'
  }
};

// Product wishlist data
const wishlistProducts = [
  {
    id: 1,
    title: 'Стерилизатор 2в1 Baby Brezza',
    imageUrl: 'https://files.ox-sys.com/cache/800x_/image/b1/fc/4c/b1fc4c1fbfa87484bde177c0854a2b50228a83d72b4c257b56dd61630d7fb869.jpg',
    productUrl: 'https://kidpoint.uz/product/sterilizator-2v1-baby-brezza-8164'
  },
  {
    id: 2,
    title: 'Кровать Baby Luxe Amina бежевая',
    imageUrl: 'https://babyhouse.uz/wp-content/uploads/2024/06/f3ccdd27d2000e3f9255a7e3e2c48800_061824163524-840x840.jpeg',
    productUrl: 'https://babyhouse.uz/product/krovat-baby-luxe-amina-bezhevaya'
  },
  {
    id: 3,
    title: 'Бесконтактный термометр для лба и уха Momcozy',
    imageUrl: 'https://babyhouse.uz/wp-content/uploads/2025/08/f3ccdd27d2000e3f9255a7e3e2c48800_081425165530.jpeg',
    productUrl: 'https://babyhouse.uz/product/beskontaktnyj-termometr-dlya-lba-i-uha-momcozy/'
  },
  {
    id: 4,
    title: 'Кофемашина Philips EP1220/00',
    imageUrl: 'https://mediapark.uz/_next/image?url=https%3A%2F%2Fcdn.mediapark.uz%2Fimgs%2F61b1016a-d379-4267-8ff2-2aedc51ad9bd_00.webp&w=640&q=75',
    productUrl: 'https://mediapark.uz/products/view/kofemashina-philips-ep1220-00-2879?srsltid=AfmBOoqMWouEs-zg32fVoGwh5tqbCKVOv3qnOzqP_jGGYK_ESWFT8Mrr'
  },
];

export default function WishlistPage() {
  const [currentLang, setCurrentLang] = useState<'en' | 'ru' | 'uz'>('ru');
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isMounted, setIsMounted] = useState(false);
  const t = translations[currentLang];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleImageError = (productId: number) => {
    setImageErrors(prev => new Set(prev).add(productId));
  };

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
          {/* Gift Icon - Full width on mobile, beside title on desktop */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-4">
            <Gift className="w-16 h-16 md:w-10 md:h-10 text-indigo-600" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              {t.title}
            </h1>
          </div>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto px-4">
            {t.description}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {wishlistProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl md:rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {!isMounted || imageErrors.has(product.id) ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                    <Gift className="w-12 h-12 md:w-20 md:h-20 text-indigo-400" />
                  </div>
                ) : (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    onError={() => handleImageError(product.id)}
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                        handleImageError(product.id);
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>

              {/* Product Info */}
              <div className="p-3 md:p-6">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2 md:mb-4 min-h-[2.5rem] md:min-h-[3.5rem] line-clamp-2">
                  {product.title}
                </h3>

                {/* View Product Link */}
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 md:gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl font-medium text-xs md:text-base transition-all shadow-md hover:shadow-lg group/btn"
                >
                  {t.viewProduct}
                  <ExternalLink className="w-3 h-3 md:w-4 md:h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
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

