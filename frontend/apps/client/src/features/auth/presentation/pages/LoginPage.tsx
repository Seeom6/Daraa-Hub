/**
 * Login Page
 * Presentation layer - UI for login
 *
 * Features:
 * - Beautiful gradient design
 * - Animated components
 * - Form validation
 * - Clean separation of logic and UI
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Phone, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import { useLogin } from '../../hooks';
import {
  AnimatedBackground,
  AuthCard,
  AuthHeader,
  FormField,
  GradientButton,
  AuthDivider,
  PrivacyNotice,
  Logo,
  StyledInput,
} from '../../components/ui';

/**
 * Custom Hook: useLoginForm
 * Handles form state and validation logic
 */
function useLoginForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { phone?: string; password?: string } = {};

    if (!phone) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^\+963\d{9}$/.test(phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    phone,
    setPhone,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errors,
    validate,
  };
}

/**
 * LoginPage Component
 */
export function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useLogin();
  const {
    phone,
    setPhone,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errors,
    validate,
  } = useLoginForm();

  const handleSubmit =  (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    login({ phoneNumber: phone, password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 p-4 relative overflow-hidden"
      dir="rtl"
    >
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Logo size="lg" />

        {/* Card */}
        <AuthCard>
          {/* Header */}
          <AuthHeader
            title="أهلاً بعودتك!"
            subtitle="سجّل دخولك واستمتع بالتسوق الذكي"
            emoji="👋"
          />

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone Number */}
              <FormField label="رقم الهاتف" required error={errors.phone} delay={0.4}>
                <StyledInput
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+963991234567"
                  dir="ltr"
                  rightIcon={<Phone className="w-5 h-5" />}
                />
              </FormField>

              {/* Password */}
              <FormField label="كلمة السر" required error={errors.password} delay={0.5}>
                <StyledInput
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  rightIcon={<Lock className="w-5 h-5" />}
                  rightAction={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                />
              </FormField>

              {/* Forgot Password Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-left"
              >
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1 group"
                >
                  نسيت كلمة السر؟
                  <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              {/* Submit Button */}
              <GradientButton
                type="submit"
                loading={isLoading}
                loadingText="جاري تسجيل الدخول..."
                icon={<LogIn className="w-5 h-5" />}
                delay={0.7}
              >
                تسجيل الدخول
              </GradientButton>
            </form>

            {/* Divider */}
            <AuthDivider />

            {/* Action Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="space-y-3"
            >
              {/* Signup Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ليس لديك حساب؟{' '}
                  <Link
                    href="/auth/register"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1 group"
                  >
                    سجل الآن
                    <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>

              {/* Continue as Guest */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline decoration-dotted underline-offset-4 transition-colors"
                >
                  المتابعة كزائر
                </button>
              </div>
            </motion.div>
          </div>
        </AuthCard>

        {/* Privacy Notice */}
        <PrivacyNotice text="تسجيل الدخول يعني موافقتك على" />
      </motion.div>
    </div>
  );
}

