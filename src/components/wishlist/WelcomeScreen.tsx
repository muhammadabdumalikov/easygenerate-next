'use client';

import { Gift, Heart, Star, Share2, Lock } from 'react-feather';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  currentLang: 'en' | 'ru' | 'uz';
}

const translations = {
  en: {
    title: 'Welcome to Your Wishlist',
    subtitle: 'Create, manage, and share your dream wishlist with friends and family',
    getStarted: 'Get Started',
    features: [
      {
        icon: Gift,
        title: 'Create Your Wishlist',
        description: 'Add unlimited items with images and links to products you love',
      },
      {
        icon: Share2,
        title: 'Share Easily',
        description: 'Get a unique link to share your wishlist with anyone',
      },
      {
        icon: Lock,
        title: 'Private & Secure',
        description: 'Your wishlist is private and only accessible with your account',
      },
    ],
  },
  ru: {
    title: 'Добро пожаловать в ваш список желаний',
    subtitle: 'Создавайте, управляйте и делитесь списком желаний с друзьями и семьей',
    getStarted: 'Начать',
    features: [
      {
        icon: Gift,
        title: 'Создайте свой список',
        description: 'Добавляйте неограниченное количество товаров с изображениями и ссылками',
      },
      {
        icon: Share2,
        title: 'Легко делитесь',
        description: 'Получите уникальную ссылку для обмена списком с кем угодно',
      },
      {
        icon: Lock,
        title: 'Приватно и безопасно',
        description: 'Ваш список приватный и доступен только с вашей учетной записью',
      },
    ],
  },
  uz: {
    title: 'Istaklar ro\'yxatingizga xush kelibsiz',
    subtitle: 'Do\'stlar va oila a\'zolari bilan istaklar ro\'yxatingizni yarating, boshqaring va ulashing',
    getStarted: 'Boshlash',
    features: [
      {
        icon: Gift,
        title: 'Ro\'yxatingizni yarating',
        description: 'Yoqtirgan mahsulotlaringizni rasm va havolalar bilan qo\'shing',
      },
      {
        icon: Share2,
        title: 'Oson ulashing',
        description: 'Ro\'yxatingizni har kim bilan ulashish uchun noyob havola oling',
      },
      {
        icon: Lock,
        title: 'Xavfsiz va shaxsiy',
        description: 'Ro\'yxatingiz shaxsiy va faqat sizning hisobingiz orqali ochiladi',
      },
    ],
  },
};

export default function WelcomeScreen({
  onGetStarted,
  currentLang,
}: WelcomeScreenProps) {
  const t = translations[currentLang];

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-16">
      {/* Hero Section */}
      <div className="text-center mb-12 md:mb-16">
        {/* Animated Icons */}
        <div className="flex justify-center gap-4 mb-6 animate-in fade-in zoom-in duration-500">
          <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl animate-bounce delay-100">
            <Gift className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" />
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl animate-bounce delay-200">
            <Heart className="w-8 h-8 md:w-10 md:h-10 text-purple-600" />
          </div>
          <div className="p-4 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl animate-bounce delay-300">
            <Star className="w-8 h-8 md:w-10 md:h-10 text-pink-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 animate-in slide-in-from-bottom duration-700">
          {t.title}
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 animate-in slide-in-from-bottom duration-700 delay-200">
          {t.subtitle}
        </p>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 active:scale-95 animate-in zoom-in duration-700 delay-300"
        >
          <Star className="w-6 h-6" />
          {t.getStarted}
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {t.features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 md:p-8 border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom"
              style={{ animationDelay: `${400 + index * 100}ms` }}
            >
              <div className="mb-4">
                <div className="inline-flex p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom Decoration */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-full border-2 border-indigo-100">
          <Star className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-semibold text-gray-700">
            {currentLang === 'en' && 'Free forever • No credit card required'}
            {currentLang === 'ru' && 'Бесплатно навсегда • Без кредитной карты'}
            {currentLang === 'uz' && 'Abadiy bepul • Karta talab qilinmaydi'}
          </span>
        </div>
      </div>
    </div>
  );
}

