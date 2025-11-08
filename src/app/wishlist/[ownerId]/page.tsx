'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExternalLink, Gift, Heart, ArrowRight, Star } from 'react-feather';
import { fetchPublicWishlist, type WishlistItem } from '@/lib/api/wishlist';

// Translations
const translations = {
  en: {
    title: 'Wishlist',
    description: 'Here are some items I\'d love to receive. Click on any product to view more details and purchase options.',
    viewProduct: 'View Product',
    footerNote: '💝 These are just suggestions! Any gift or even just your kind thoughts are greatly appreciated. Thank you for being so thoughtful!',
    loading: 'Loading wishlist...',
    empty: 'This wishlist is empty',
    emptySubtitle: 'The owner hasn\'t added any items yet',
    error: 'Failed to load wishlist',
    errorSubtitle: 'Please check the link and try again',
    createYourOwn: 'Create Your Own Wishlist',
    createSubtitle: 'Start building your dream wishlist and share it with loved ones',
  },
  ru: {
    title: 'Список желаний',
    description: 'Вот некоторые предметы, которые мне бы хотелось получить. Нажмите на любой продукт, чтобы просмотреть подробности и варианты покупки.',
    viewProduct: 'Просмотр продукта',
    footerNote: '💝 Это всего лишь предложения! Любой подарок или даже просто ваши добрые мысли очень ценятся. Спасибо, что вы такие внимательные!',
    loading: 'Загрузка списка желаний...',
    empty: 'Этот список желаний пуст',
    emptySubtitle: 'Владелец еще не добавил никаких элементов',
    error: 'Не удалось загрузить список желаний',
    errorSubtitle: 'Пожалуйста, проверьте ссылку и попробуйте снова',
    createYourOwn: 'Создайте свой список желаний',
    createSubtitle: 'Начните создавать список своей мечты и поделитесь им с близкими',
  },
  uz: {
    title: 'Istaklar ro\'yxati',
    description: 'Quyida menga juda yoqadigan ba\'zi narsalar. Batafsil ma\'lumot va xarid qilish variantlarini ko\'rish uchun har qanday mahsulotni bosing.',
    viewProduct: 'Mahsulotni ko\'rish',
    footerNote: '💝 Bu faqat takliflar! Har qanday sovg\'a yoki hatto faqat sizning mehribon fikrlaringiz juda qadrlanadi. Sizga minnatdorman!',
    loading: 'Istaklar ro\'yxati yuklanmoqda...',
    empty: 'Bu istaklar ro\'yxati bo\'sh',
    emptySubtitle: 'Egasi hali hech narsa qo\'shmagan',
    error: 'Istaklar ro\'yxatini yuklashda xatolik',
    errorSubtitle: 'Iltimos, havolani tekshiring va qayta urinib ko\'ring',
    createYourOwn: 'O\'z istaklar ro\'yxatingizni yarating',
    createSubtitle: 'Orzuingizdagi ro\'yxatni yaratishni boshlang va yaqinlaringiz bilan ulashing',
  },
};

export default function PublicWishlistPage() {
  const params = useParams();
  const router = useRouter();
  const ownerId = params.ownerId as string;

  const [currentLang, setCurrentLang] = useState<'en' | 'ru' | 'uz'>('ru');
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);

  const t = translations[currentLang];

  useEffect(() => {
    setIsMounted(true);
    loadWishlist();
  }, [ownerId]);

  const loadWishlist = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const data = await fetchPublicWishlist(ownerId);
      setItems(data);
    } catch (err) {
      console.error('Error loading wishlist:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set(prev).add(id));
  };

  const handleCreateOwn = () => {
    router.push('/wishlist');
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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">{t.loading}</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.error}</h3>
              <p className="text-gray-600 mb-6">{t.errorSubtitle}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && items.length === 0 && (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.empty}</h3>
              <p className="text-gray-600">{t.emptySubtitle}</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {items.map((product) => (
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
                      src={product.imageurl}
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
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900 min-h-[2.5rem] md:min-h-[3.5rem] line-clamp-2 mb-3">
                    {product.title}
                  </h3>

                  {/* View Product Link */}
                  <a
                    href={product.producturl}
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
        )}

        {/* Create Your Own Wishlist CTA */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
            
            <div className="relative text-center text-white">
              <div className="flex justify-center gap-2 mb-4">
                <Star className="w-8 h-8" />
                <Heart className="w-8 h-8" />
                <Gift className="w-8 h-8" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {t.createYourOwn}
              </h2>
              <p className="text-white/90 mb-6 max-w-xl mx-auto">
                {t.createSubtitle}
              </p>
              <button
                onClick={handleCreateOwn}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                {t.createYourOwn}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        {!isLoading && !error && items.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-2xl mx-auto">
              <p className="text-gray-600 text-sm">{t.footerNote}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

