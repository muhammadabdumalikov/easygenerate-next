'use client';

import { Gift, Plus, Star, Heart } from 'react-feather';

interface EmptyWishlistProps {
  onCreateFirst: () => void;
  currentLang: 'en' | 'ru' | 'uz';
}

const translations = {
  en: {
    title: 'Your Wishlist is Empty',
    subtitle: 'Start building your dream wishlist',
    description: 'Add items you love and share your wishlist with friends and family. They\'ll know exactly what makes you happy!',
    createFirst: 'Add Your First Item',
    features: [
      { icon: Gift, text: 'Add unlimited items' },
      { icon: Heart, text: 'Share with loved ones' },
      { icon: Star, text: 'Track your wishes' },
    ],
  },
  ru: {
    title: 'Ваш список желаний пуст',
    subtitle: 'Начните создавать список своей мечты',
    description: 'Добавляйте любимые вещи и делитесь списком с друзьями и семьей. Они будут точно знать, что сделает вас счастливыми!',
    createFirst: 'Добавить первый товар',
    features: [
      { icon: Gift, text: 'Неограниченное количество товаров' },
      { icon: Heart, text: 'Делитесь с близкими' },
      { icon: Star, text: 'Отслеживайте желания' },
    ],
  },
  uz: {
    title: 'Sizning istaklar ro\'yxatingiz bo\'sh',
    subtitle: 'Orzuingizdagi ro\'yxatni yaratishni boshlang',
    description: 'Yoqtirgan narsalaringizni qo\'shing va do\'stlaringiz hamda oilangiz bilan baham ko\'ring. Ular sizni nima xursand qilishini aniq bilishadi!',
    createFirst: 'Birinchi mahsulotni qo\'shish',
    features: [
      { icon: Gift, text: 'Cheksiz mahsulotlar' },
      { icon: Heart, text: 'Yaqinlaringiz bilan baham ko\'ring' },
      { icon: Star, text: 'Istaklaringizni kuzating' },
    ],
  },
};

export default function EmptyWishlist({ onCreateFirst, currentLang }: EmptyWishlistProps) {
  const t = translations[currentLang];

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
          {/* Gradient Header */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-center">
            <div className="inline-flex p-6 bg-white/20 backdrop-blur-sm rounded-3xl mb-4 animate-bounce">
              <Gift className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t.title}
            </h2>
            <p className="text-white/90 text-lg">
              {t.subtitle}
            </p>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <p className="text-gray-600 text-center text-lg mb-8">
              {t.description}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {t.features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <div className="p-3 bg-white rounded-xl shadow-sm mb-3">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 text-center">
                      {feature.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <button
              onClick={onCreateFirst}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-6 h-6" />
              {t.createFirst}
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-2 mt-6 opacity-50">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}

