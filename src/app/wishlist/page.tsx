'use client';

import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Gift, Plus, Edit2, Trash2, Lock, Unlock, LogOut } from 'react-feather';
import WishlistModal from '@/components/wishlist/WishlistModal';
import AdminLoginModal from '@/components/wishlist/AdminLoginModal';
import {
  fetchWishlistItems,
  createWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
  type WishlistItem,
  type CreateWishlistDto,
  type UpdateWishlistDto,
} from '@/lib/api/wishlist';

// Translations
const translations = {
  en: {
    title: 'List of things which you can gift to me',
    description: 'Thanks for considering! Here are some items I\'d love to receive. Click on any product to view more details and purchase options.',
    viewProduct: 'View Product',
    footerNote: '💝 These are just suggestions! Any gift or even just your kind thoughts are greatly appreciated. Thank you for being so thoughtful!',
    adminMode: 'Admin Mode',
    adminLogin: 'Admin Login',
    adminLogout: 'Log out',
    addNew: 'Add New Item',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this item?',
    loading: 'Loading...',
    localItem: 'Local',
    apiItem: 'API',
    username: 'Username',
    password: 'Password',
    login: 'Log In',
    loggingIn: 'Logging in...',
    invalidCredentials: 'Invalid username or password.',
    welcomeBack: 'Welcome back! Admin controls unlocked.',
    cancel: 'Cancel',
  },
  ru: {
    title: 'Список вещей, которые вы можете мне подарить',
    description: 'Спасибо, что рассмотрели! Вот некоторые предметы, которые мне бы хотелось получить. Нажмите на любой продукт, чтобы просмотреть подробности и варианты покупки.',
    viewProduct: 'Просмотр продукта',
    footerNote: '💝 Это всего лишь предложения! Любой подарок или даже просто ваши добрые мысли очень ценятся. Спасибо, что вы такие внимательные!',
    adminMode: 'Режим администратора',
    adminLogin: 'Вход администратора',
    adminLogout: 'Выйти',
    addNew: 'Добавить новый',
    edit: 'Редактировать',
    delete: 'Удалить',
    confirmDelete: 'Вы уверены, что хотите удалить этот элемент?',
    loading: 'Загрузка...',
    localItem: 'Локальный',
    apiItem: 'API',
    username: 'Имя пользователя',
    password: 'Пароль',
    login: 'Войти',
    loggingIn: 'Вход...',
    invalidCredentials: 'Неверное имя пользователя или пароль.',
    welcomeBack: 'С возвращением! Режим администратора активирован.',
    cancel: 'Отмена',
  },
  uz: {
    title: 'Menga sovg\'a qila oladigan narsalar ro\'yxati',
    description: 'Ko\'rib chiqganingiz uchun rahmat! Quyida menga juda yoqadigan ba\'zi narsalar. Batafsil ma\'lumot va xarid qilish variantlarini ko\'rish uchun har qanday mahsulotni bosing.',
    viewProduct: 'Mahsulotni ko\'rish',
    footerNote: '💝 Bu faqat takliflar! Har qanday sovg\'a yoki hatto faqat sizning mehribon fikrlaringiz juda qadrlanadi. Sizga minnatdorman!',
    adminMode: 'Admin rejimi',
    adminLogin: 'Admin kirishi',
    adminLogout: 'Chiqish',
    addNew: 'Yangi qo\'shish',
    edit: 'Tahrirlash',
    delete: 'O\'chirish',
    confirmDelete: 'Ushbu elementni o\'chirishga ishonchingiz komilmi?',
    loading: 'Yuklanmoqda...',
    localItem: 'Lokal',
    apiItem: 'API',
    username: 'Foydalanuvchi nomi',
    password: 'Parol',
    login: 'Kirish',
    loggingIn: 'Kirilmoqda...',
    invalidCredentials: 'Foydalanuvchi nomi yoki parol noto\'g\'ri.',
    welcomeBack: 'Xush kelibsiz! Admin boshqaruvi yoqildi.',
    cancel: 'Bekor qilish',
  }
};

const ADMIN_USERNAME = 'yayra';
const ADMIN_PASSWORD = 'mys2810';

// Product wishlist data
const wishlistProducts = [
  {
    id: '3',
    title: 'Бесконтактный термометр для лба и уха Momcozy',
    imageurl: 'https://babyhouse.uz/wp-content/uploads/2025/08/f3ccdd27d2000e3f9255a7e3e2c48800_081425165530.jpeg',
    producturl: 'https://babyhouse.uz/product/beskontaktnyj-termometr-dlya-lba-i-uha-momcozy/'
  },
  {
    id: '4',
    title: 'Кофемашина Philips EP1220/00',
    imageurl: 'https://mediapark.uz/_next/image?url=https%3A%2F%2Fcdn.mediapark.uz%2Fimgs%2F61b1016a-d379-4267-8ff2-2aedc51ad9bd_00.webp&w=640&q=75',
    producturl: 'https://mediapark.uz/products/view/kofemashina-philips-ep1220-00-2879?srsltid=AfmBOoqMWouEs-zg32fVoGwh5tqbCKVOv3qnOzqP_jGGYK_ESWFT8Mrr'
  },
  {
    id: '5',
    title: 'Mi 360° Home Security Camera 2K Pro',
    imageurl: 'https://minicam.uz/wp-content/uploads/2021/04/mi-home-security-2k-360-camera.jpg',
    producturl: 'https://minicam.uz/product/mi-360-home-security-camera-2k-pro/'
  },
  {
    id: '6',
    title: 'Стеклянный чайник French Press Kukmara, 1 л, с металлическим фильтром для заваривания кофе и чая',
    imageurl: 'https://avatars.mds.yandex.net/get-mpic/15549911/2a0000019928db8efacab669e521dc49dcb6/180x240',
    producturl: 'https://market.yandex.uz/card/steklyannyy-chaynik-french-press-kukmara-1-l/103836083562?do-waremd5=dj_9B1zmNJc-Z_MOuGj-gA&nid=60862720&publicId=fqyvc5857ny9kp8c3gcykzky40&utm_medium=sharing&ogV=10'
  },
  {
    id: '7',
    title: 'Пионовидные розы',
    imageurl: 'https://buchet.uz/_next/image?url=https%3A%2F%2Ftfstorage.buchet.uz%2Fapi%2Ffiles%2F2025%2F06%2F08%2F1749375309305-image_cropper_FC1806DF-D5AB-460A-8621-C816974CE2B4-1564-0000005F1E7133B6.webp&w=828&q=70',
    producturl: 'https://buchet.uz/en/product/6845594e71b25a2492da4b08'
  },
  {
    id: '8',
    title: 'Пионовидные розы',
    imageurl: 'https://buchet.uz/_next/image?url=https%3A%2F%2Ftfstorage.buchet.uz%2Fapi%2Ffiles%2F2025%2F07%2F22%2F1753222591856-image_cropper_87ACAD49-6B41-4CC9-A8E2-65138E4B956A-12822-0000046915D8F6FD.webp&w=828&q=70',
    producturl: 'https://buchet.uz/en/product/68800dc0a7705ec73ab2e4c5'
  },
  {
    id: '9',
    title: 'Часы Apple Watch Series 10',
    imageurl: 'https://macbro.uz/cdn/shop/files/MXLN3ref_VW_34FR_watch-case-42-aluminum-rosegold-nc-s10_VW_34FR_watch-face-42-aluminum-rosegold-s10_VW_34FR_1220x_crop_center.jpg?v=1748198858',
    producturl: 'https://macbro.uz/products/chasy-apple-watch-series-10?variant=49343539020074'
  },
  {
    id: '10',
    title: 'Kolyaska Ining baby',
    imageurl: '1',
    producturl: 'https://www.instagram.com/reel/DNA-RAYNP6N/?igsh=anc2M2E4MzRlYmJh'
  },
  {
    id: '11',
    title: '🌿Dr.Althea 345 Relief Cream',
    imageurl: 'https://m.media-amazon.com/images/I/51ImJkfL-NL._SX679_.jpg',
    producturl: 'https://taplink.cc/milum.uz/o/c20331/'
  },
  {
    id: '12',
    title: 'Крем для век с коллагеном Axis-Y Vegan Collagen Eye Serum',
    imageurl: 'https://comax.uz/4210-thickbox_default/vegan-collagen-eye-serum.webp',
    producturl: 'https://comax.uz/ru/tochechnyj-ukhod/vegan-collagen-eye-serum.html'
  },
  {
    id: '14',
    title: 'Подтягивающая сыворотка с ретинолом Retinol Shot Tightening Serum',
    imageurl: 'https://comax.uz/5321-thickbox_default/retinol-shot-tightening-serum.webp',
    producturl: 'https://comax.uz/ru/essenciya-i-syvorotki/retinol-shot-tightening-serum.html'
  },
  {
    id: '15',
    title: 'Подтягивающий бустер-крем с ретиналем и микроиглами Celimax Retinal Shot Tightening Booster',
    imageurl: 'https://comax.uz/4560-thickbox_default/retinal-shot-tightening-booster.webp',
    producturl: 'https://comax.uz/ru/tochechnyj-ukhod/retinal-shot-tightening-booster.html?srsltid=AfmBOoolahYs5TdCCUIMIHL60Q-4Rldxv1fUf1tVviARhu3FfN4IvX0S'
  },
  {
    id: '16',
    title: 'Доска-мольберт для рисования, детский, двусторонний, с маркерами, мелками, магнитный',
    imageurl: 'https://avatars.mds.yandex.net/get-mpic/16174181/2a000001993421cfce466dce7cf726760aa9/180x240',
    producturl: 'https://market.yandex.uz/card/doska-molbert-dlya-risovaniya-detskiy-dvustoronniy-s-markerami-melkami-magnitnyy/4578917619?do-waremd5=RHqyKpx2r9zFt_ELJCOkYg&nid=63822923&publicId=fqyvc5857ny9kp8c3gcykzky40&utm_medium=sharing&ogV=10'
  },
  {
    id: '17',
    title: 'Палатка-домик Nopino, для игр и творчества детей, складная, с окошками',
    imageurl: 'https://avatars.mds.yandex.net/get-mpic/16485002/2a00000198711a067b7545ed68f9eafb70ba/180x240',
    producturl: 'https://market.yandex.uz/card/palatka-domik-nopino-dlya-igr-i-tvorchestva-detey-skladnaya-s-okoshkami/4566829406?do-waremd5=ufu_pQhFmP5n8SuQoWJueA&nid=63754108&publicId=fqyvc5857ny9kp8c3gcykzky40&utm_medium=sharing&ogV=10'
  },
  {
    id: '18',
    title: 'La Belle',
    imageurl: 'https://parfumgallery.uz/_next/image?url=https%3A%2F%2Fspaces.parfumgallery.uz%2Fimages%2Fproducts%2F2025-09-15T07-16-01-932Z_SJP-32329_65132209_JPG-LA-BELLE-EDP-50ML.png&w=1080&q=100',
    producturl: 'https://parfumgallery.uz/catalog/la-belle?srsltid=AfmBOooMVRaFxjHUE6DtZsJPn2HJWl2DKnGq6d8G3UqMXFTAamwxPxbJ',
  },
  {
    id: '19',
    title: 'Соковыжималка Braun J700 MultiQuick 7',
    imageurl: 'https://cdn.mediapark.uz/imgs/b0389790-e4a0-434a-b5fc-d9dc92354e19_Artboard-1.webp',
    producturl: 'https://mediapark.uz/products/view/sokovyzhimalka-braun-j700-1324'
  }
];

export default function WishlistPage() {
  const [currentLang, setCurrentLang] = useState<'en' | 'ru' | 'uz'>('ru');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [apiItems, setApiItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const loginNoticeTimeoutRef = useRef<number | null>(null);

  const t = translations[currentLang];

  // Merge local products with API items
  const allProducts: WishlistItem[] = [
    ...wishlistProducts.map((p) => ({ ...p, source: 'local' as const })),
    ...apiItems,
  ];

  // Fetch API items on mount
  useEffect(() => {
    setIsMounted(true);
    loadApiItems();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.sessionStorage.getItem('converto-admin-auth');
    if (stored === 'true') {
      setIsAdminAuthenticated(true);
      setIsAdminMode(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isAdminAuthenticated) {
      window.sessionStorage.setItem('converto-admin-auth', 'true');
    } else {
      window.sessionStorage.removeItem('converto-admin-auth');
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    return () => {
      if (loginNoticeTimeoutRef.current) {
        window.clearTimeout(loginNoticeTimeoutRef.current);
        loginNoticeTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (loginNotice) {
      setLoginNotice(translations[currentLang].welcomeBack);
    }
  }, [currentLang, loginNotice]);

  const loadApiItems = async () => {
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

  const handleAdminToggle = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      return;
    }

    if (isAdminAuthenticated) {
      setIsAdminMode(true);
      return;
    }

    setShowLoginModal(true);
  };

  const handleAdminLogin = (username: string, password: string) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setIsAdminMode(true);
      setShowLoginModal(false);
      if (loginNoticeTimeoutRef.current) {
        window.clearTimeout(loginNoticeTimeoutRef.current);
      }
      setLoginNotice(t.welcomeBack);
      loginNoticeTimeoutRef.current = window.setTimeout(() => {
        setLoginNotice(null);
        loginNoticeTimeoutRef.current = null;
      }, 4000);
      return true;
    }

    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminMode(false);
    setIsAdminAuthenticated(false);
    if (loginNoticeTimeoutRef.current) {
      window.clearTimeout(loginNoticeTimeoutRef.current);
      loginNoticeTimeoutRef.current = null;
    }
    setLoginNotice(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <main className="px-8 py-12 max-w-7xl mx-auto">
        {/* Language & Admin Controls */}
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          {/* Admin Controls */}
          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                onClick={handleAdminLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-800"
              >
                <LogOut className="h-4 w-4" />
                {t.adminLogout}
              </button>
            )}
            <button
              onClick={handleAdminToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all border-2 ${
                isAdminMode
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {isAdminMode ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.adminMode}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.adminMode}</span>
                </>
              )}
            </button>
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

        {loginNotice && (
          <div className="mb-6">
            <div className="mx-auto max-w-xl rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
              {loginNotice}
            </div>
          </div>
        )}

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

        {/* Add New Item Button (Admin Mode) */}
        {isAdminMode && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
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

        {/* Products Grid */}
        {!isLoading && (
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

                {/* Admin Controls */}
                {isAdminMode && product.source === 'api' && (
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
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-2xl mx-auto">
            <p className="text-gray-600 text-sm">
              {t.footerNote}
            </p>
          </div>
        </div>
      </main>

      {/* Modal */}
      <WishlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={modalMode === 'create' ? handleCreateItem : handleUpdateItem}
        item={selectedItem}
        mode={modalMode}
        currentLang={currentLang}
      />
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSubmit={handleAdminLogin}
        translations={t}
      />
    </div>
  );
}

