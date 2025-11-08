'use client';

import { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, X } from 'react-feather';

interface AdminTranslations {
  adminLogin: string;
  cancel: string;
  username: string;
  password: string;
  login: string;
  loggingIn: string;
  invalidCredentials: string;
}

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string, password: string) => boolean;
  translations: AdminTranslations;
}

export default function AdminLoginModal({
  isOpen,
  onClose,
  onSubmit,
  translations,
}: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setError(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const success = onSubmit(username.trim(), password);
      if (!success) {
        setError(translations.invalidCredentials);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-2 text-gray-900">
            <Lock className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">{translations.adminLogin}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label htmlFor="admin-username" className="text-sm font-medium text-gray-700">
              {translations.username}
            </label>
            <div className="flex items-center gap-2 rounded-xl border-2 border-gray-200 px-3 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
              <User className="h-4 w-4 text-gray-400" />
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-10 w-full border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                placeholder="username"
                autoComplete="username"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
              {translations.password}
            </label>
            <div className="flex items-center gap-2 rounded-xl border-2 border-gray-200 px-3 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
              <Lock className="h-4 w-4 text-gray-400" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-10 w-full border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {translations.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? translations.loggingIn : translations.login}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


