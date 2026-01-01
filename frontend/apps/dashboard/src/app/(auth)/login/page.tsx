/**
 * Login Page
 * Store Owner login page
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/features/store/hooks';
import { Store, Lock, Phone } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ phoneNumber, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Daraa Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            لوحة تحكم أصحاب المتاجر
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            تسجيل الدخول
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                رقم الهاتف
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+963991111125"
                  required
                  className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              بيانات تجريبية:
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              الهاتف: +963992405251
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              كلمة المرور: StoreOwner@123
            </p>
          </div>

          {/* Note about Client App Login */}
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">
              💡 نصيحة:
            </p>
            <p className="text-xs text-green-700 dark:text-green-400">
              يمكنك تسجيل الدخول من تطبيق العملاء (Client App) وسيتم توجيهك تلقائياً إلى لوحة التحكم
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          © 2024 Daraa Hub. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}

