'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Gift, Plus, Edit2, Trash2, LogOut, User, Share2 } from 'react-feather';
import WishlistModal from '@/components/wishlist/WishlistModal';
import AuthModal from '@/components/wishlist/AuthModal';
import EmptyWishlist from '@/components/wishlist/EmptyWishlist';
import ShareModal from '@/components/wishlist/ShareModal';
import WelcomeScreen from '@/components/wishlist/WelcomeScreen';
import {
  fetchWishlistItems,
  createWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
  isAuthenticated,
  signIn,
  signUp,
  signOut,
  getOwnerId,
  type WishlistItem,
  type CreateWishlistDto,
  type UpdateWishlistDto,
  type AuthCredentials,
} from '@/lib/api/wishlist';

// Translations
const translations = {
  en: {
    title: 'List of things which you can gift to me',
    description: 'Thanks for considering! Here are some items I\'d love to receive. Click on any product to view more details and purchase options.',
    viewProduct: 'View Product',
    footerNote: '💝 These are just suggestions! Any gift or even just your kind thoughts are greatly appreciated. Thank you for being so thoughtful!',
    addNew: 'Add New Item',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this item?',
    loading: 'Loading...',
    localItem: 'Local',
    apiItem: 'My Wishlist',
    share: 'Share',
    signIn: 'Sign In',
  },
  ru: {
    title: 'Список вещей, которые вы можете мне подарить',
    description: 'Спасибо, что рассмотрели! Вот некоторые предметы, которые мне бы хотелось получить. Нажмите на любой продукт, чтобы просмотреть подробности и варианты покупки.',
    viewProduct: 'Просмотр продукта',
    footerNote: '💝 Это всего лишь предложения! Любой подарок или даже просто ваши добрые мысли очень ценятся. Спасибо, что вы такие внимательные!',
    addNew: 'Добавить новый',
    edit: 'Редактировать',
    delete: 'Удалить',
    confirmDelete: 'Вы уверены, что хотите удалить этот элемент?',
    loading: 'Загрузка...',
    localItem: 'Локальный',
    apiItem: 'Мой список',
    share: 'Поделиться',
    signIn: 'Войти',
  },
  uz: {
    title: 'Menga sovg\'a qila oladigan narsalar ro\'yxati',
    description: 'Ko\'rib chiqganingiz uchun rahmat! Quyida menga juda yoqadigan ba\'zi narsalar. Batafsil ma\'lumot va xarid qilish variantlarini ko\'rish uchun har qanday mahsulotni bosing.',
    viewProduct: 'Mahsulotni ko\'rish',
    footerNote: '💝 Bu faqat takliflar! Har qanday sovg\'a yoki hatto faqat sizning mehribon fikrlaringiz juda qadrlanadi. Sizga minnatdorman!',
    addNew: 'Yangi qo\'shish',
    edit: 'Tahrirlash',
    delete: 'O\'chirish',
    confirmDelete: 'Ushbu elementni o\'chirishga ishonchingiz komilmi?',
    loading: 'Yuklanmoqda...',
    localItem: 'Lokal',
    apiItem: 'Mening ro\'yxatim',
    share: 'Ulashish',
    signIn: 'Kirish',
  }
};


export default function WishlistPage() {
  const [currentLang, setCurrentLang] = useState<'en' | 'ru' | 'uz'>('ru');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [apiItems, setApiItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);

  const t = translations[currentLang];

  // Merge local products with API items
  const allProducts: WishlistItem[] = apiItems;

  // Check authentication on mount
  useEffect(() => {
    setIsMounted(true);
    const authenticated = isAuthenticated();
    setIsUserAuthenticated(authenticated);
    
    if (authenticated) {
      loadApiItems();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadApiItems = async () => {
    if (!isAuthenticated()) {
      setApiItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const items = await fetchWishlistItems();
      setApiItems(items.map((item) => ({ ...item, source: 'api' as const })));
    } catch (error) {
      console.error('Failed to load API items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSignIn = async (credentials: AuthCredentials) => {
    await signIn(credentials);
    setIsUserAuthenticated(true);
    setShowAuthModal(false);
    await loadApiItems();
  };

  const handleUserSignUp = async (credentials: AuthCredentials) => {
    await signUp(credentials);
    setIsUserAuthenticated(true);
    setShowAuthModal(false);
    await loadApiItems();
  };

  const handleUserSignOut = () => {
    signOut();
    setIsUserAuthenticated(false);
    setApiItems([]);
    setShowAuthModal(true);
  };

  const handleImageError = (productId: string) => {
    setImageErrors(prev => new Set(prev).add(productId));
  };

  const handleCreateItem = async (data: CreateWishlistDto) => {
    const newItem = await createWishlistItem(data);
    if (newItem) {
      setApiItems((prev) => [...prev, { ...newItem, source: 'api' }]);
    }
  };

  const handleUpdateItem = async (data: UpdateWishlistDto) => {
    if (!selectedItem) return;
    const updatedItem = await updateWishlistItem(selectedItem.id, data);
    if (updatedItem) {
      setApiItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id ? { ...updatedItem, source: 'api' } : item
        )
      );
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    const success = await deleteWishlistItem(id);
    if (success) {
      setApiItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const openCreateModal = () => {
    setSelectedItem(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (item: WishlistItem) => {
    setSelectedItem(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <main className="px-8 py-12 max-w-7xl mx-auto">
        {/* Language & Controls */}
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          {/* Left: User Controls */}
          <div className="flex items-center gap-2">
            {/* Sign In Button - Show when NOT authenticated */}
            {!isUserAuthenticated && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-4 py-2 text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg"
              >
                <User className="h-4 w-4" />
                <span>{t.signIn}</span>
              </button>
            )}

            {/* User Sign Out */}
            {isUserAuthenticated && (
              <button
                onClick={handleUserSignOut}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-red-50 hover:text-red-600 border-2 border-gray-200 hover:border-red-300 shadow-sm"
              >
                <User className="h-4 w-4" />
                <LogOut className="h-4 w-4" />
              </button>
            )}
            
            {/* Share Button */}
            {isUserAuthenticated && apiItems.length > 0 && (
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-4 py-2 text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t.share}</span>
              </button>
            )}
          </div>

        {/* Language Selector */}
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

        {/* Welcome Screen for First-Time Users */}
        {!isUserAuthenticated && !isLoading && (
          <WelcomeScreen
            onGetStarted={() => setShowAuthModal(true)}
            currentLang={currentLang}
          />
        )}

        {/* Header Section - Only show for authenticated users */}
        {isUserAuthenticated && (
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
        )}

        {/* Content for Authenticated Users Only */}
        {isUserAuthenticated && (
          <>
            {/* Add New Item Button - Show only if user has items */}
            {apiItems.length > 0 && (
              <div className="mb-6 flex justify-center">
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  {t.addNew}
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">{t.loading}</p>
              </div>
            )}

            {/* Empty State - Show when user is authenticated but has no items */}
            {!isLoading && apiItems.length === 0 && (
              <EmptyWishlist
                onCreateFirst={openCreateModal}
                currentLang={currentLang}
              />
            )}

            {/* Products Grid */}
            {!isLoading && apiItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {allProducts.map((product) => (
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
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900 min-h-[2.5rem] md:min-h-[3.5rem] line-clamp-2 flex-1">
                  {product.title}
                </h3>
                  {/* Source Badge */}
                  <span
                    className={`text-[10px] md:text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                      product.source === 'api'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {product.source === 'api' ? t.apiItem : t.localItem}
                  </span>
                </div>

                {/* Edit/Delete Controls - Only for user's own items */}
                {isUserAuthenticated && product.source === 'api' && (
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span className="hidden sm:inline">{t.edit}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(product.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden sm:inline">{t.delete}</span>
                    </button>
                  </div>
                )}

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

            {/* Footer Note */}
            {apiItems.length > 0 && (
              <div className="mt-12 text-center">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-2xl mx-auto">
                  <p className="text-gray-600 text-sm">
                    {t.footerNote}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleUserSignIn}
        onSignUp={handleUserSignUp}
        currentLang={currentLang}
      />
      
      <WishlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={modalMode === 'create' ? handleCreateItem : handleUpdateItem}
        item={selectedItem}
        mode={modalMode}
        currentLang={currentLang}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        ownerId={getOwnerId() || ''}
        currentLang={currentLang}
      />
    </div>
  );
}

