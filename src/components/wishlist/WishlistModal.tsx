'use client';

import { useState, useEffect } from 'react';
import { X, Gift, Image, Link2 } from 'react-feather';
import type { WishlistItem, CreateWishlistDto, UpdateWishlistDto } from '@/lib/api/wishlist';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWishlistDto | UpdateWishlistDto) => Promise<void>;
  item?: WishlistItem | null;
  mode: 'create' | 'edit';
  currentLang: 'en' | 'ru' | 'uz';
}

const modalTranslations = {
  en: {
    createTitle: 'Add New Item',
    editTitle: 'Edit Item',
    titleLabel: 'Title',
    titlePlaceholder: 'Enter product title',
    imageUrlLabel: 'Image URL',
    imageUrlPlaceholder: 'https://example.com/image.jpg',
    productUrlLabel: 'Product URL',
    productUrlPlaceholder: 'https://example.com/product',
    cancel: 'Cancel',
    save: 'Save',
    create: 'Create',
    saving: 'Saving...',
  },
  ru: {
    createTitle: 'Добавить новый товар',
    editTitle: 'Редактировать товар',
    titleLabel: 'Название',
    titlePlaceholder: 'Введите название товара',
    imageUrlLabel: 'URL изображения',
    imageUrlPlaceholder: 'https://example.com/image.jpg',
    productUrlLabel: 'URL товара',
    productUrlPlaceholder: 'https://example.com/product',
    cancel: 'Отмена',
    save: 'Сохранить',
    create: 'Создать',
    saving: 'Сохранение...',
  },
  uz: {
    createTitle: 'Yangi mahsulot qo\'shish',
    editTitle: 'Mahsulotni tahrirlash',
    titleLabel: 'Nomi',
    titlePlaceholder: 'Mahsulot nomini kiriting',
    imageUrlLabel: 'Rasm URL',
    imageUrlPlaceholder: 'https://example.com/image.jpg',
    productUrlLabel: 'Mahsulot URL',
    productUrlPlaceholder: 'https://example.com/product',
    cancel: 'Bekor qilish',
    save: 'Saqlash',
    create: 'Yaratish',
    saving: 'Saqlanmoqda...',
  },
};

export default function WishlistModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  mode,
  currentLang,
}: WishlistModalProps) {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = modalTranslations[currentLang];

  useEffect(() => {
    if (item && mode === 'edit') {
      setTitle(item.title);
      setImageUrl(item.imageurl ?? '');
      setProductUrl(item.producturl ?? '');
    } else {
      setTitle('');
      setImageUrl('');
      setProductUrl('');
    }
  }, [item, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        title,
        imageurl: imageUrl,
        producturl: productUrl,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Simple Background with Opacity */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Gift className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">
                {mode === 'create' ? t.createTitle : t.editTitle}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Gift className="w-4 h-4 text-indigo-600" />
              {t.titleLabel}
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Image URL Input */}
          <div className="space-y-2">
            <label htmlFor="imageUrl" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Image className="w-4 h-4 text-purple-600" />
              {t.imageUrlLabel}
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={t.imageUrlPlaceholder}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            />
            {imageUrl && (
              <div className="mt-3 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-56 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Product URL Input */}
          <div className="space-y-2">
            <label htmlFor="productUrl" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Link2 className="w-4 h-4 text-pink-600" />
              {t.productUrlLabel}
            </label>
            <input
              type="url"
              id="productUrl"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder={t.productUrlPlaceholder}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? t.saving : mode === 'create' ? t.create : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

