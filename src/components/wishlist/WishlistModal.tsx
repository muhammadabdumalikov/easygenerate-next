'use client';

import { useState, useEffect } from 'react';
import { X } from 'react-feather';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? t.createTitle : t.editTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              {t.titleLabel}
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          {/* Image URL Input */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-700 mb-2">
              {t.imageUrlLabel}
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={t.imageUrlPlaceholder}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
            {imageUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Product URL Input */}
          <div>
            <label htmlFor="productUrl" className="block text-sm font-semibold text-gray-700 mb-2">
              {t.productUrlLabel}
            </label>
            <input
              type="url"
              id="productUrl"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder={t.productUrlPlaceholder}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? t.saving : mode === 'create' ? t.create : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

