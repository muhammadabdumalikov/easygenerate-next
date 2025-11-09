'use client';

import { useState, useEffect } from 'react';
import { X, Share2, Copy, Check, Link2 } from 'react-feather';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId: string;
  currentLang: 'en' | 'ru' | 'uz';
}

const translations = {
  en: {
    title: 'Share Your Wishlist',
    subtitle: 'Share this link with friends and family so they can see your wishlist',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    close: 'Close',
    shareUrl: 'Your Shareable Link',
  },
  ru: {
    title: 'Поделиться списком желаний',
    subtitle: 'Поделитесь этой ссылкой с друзьями и семьей, чтобы они могли увидеть ваш список желаний',
    copyLink: 'Копировать ссылку',
    copied: 'Скопировано!',
    close: 'Закрыть',
    shareUrl: 'Ваша ссылка для обмена',
  },
  uz: {
    title: 'Istaklar ro\'yxatini ulashish',
    subtitle: 'Do\'stlar va oila a\'zolariga istaklar ro\'yxatingizni ko\'rishlari uchun ushbu havolani ulashing',
    copyLink: 'Havolani nusxalash',
    copied: 'Nusxalandi!',
    close: 'Yopish',
    shareUrl: 'Ulashish havolangiz',
  },
};

export default function ShareModal({
  isOpen,
  onClose,
  ownerId,
  currentLang,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const t = translations[currentLang];

  useEffect(() => {
    async function getShortUrl() {
      if (isOpen && typeof window !== 'undefined') {
        const url = `${window.location.origin}/wishlist/${ownerId}`;

        try {
          const response = await fetch('https://ulvis.net/api/v1/shorten', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url,
            }),
          });
          const data = await response.json();
          if (data && data.shortUrl) {
            setShareUrl(data.shortUrl);
          } else {
            setShareUrl(url);
            console.warn('Shorten API did not return a shortUrl, using original URL.');
          }
        } catch (error) {
          setShareUrl(url);
          console.error('Failed to shorten URL:', error);
        }
      }
    }

    getShortUrl();
  }, [isOpen, ownerId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Background */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-3 text-white/90 text-sm relative">{t.subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Share URL Display */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Link2 className="w-4 h-4 text-indigo-600" />
              {t.shareUrl}
            </label>
            <div className="flex gap-3">
              <div className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 text-sm break-all">
                {shareUrl}
              </div>
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={copied}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-90 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                {t.copied}
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                {t.copyLink}
              </>
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

