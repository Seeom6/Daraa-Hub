'use client';

/**
 * Register Page
 *
 * Multi-step registration (3 steps)
 * Features:
 * - Beautiful gradient design
 * - Animated components
 * - Form validation
 * - Clean separation of logic and UI
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { User, Phone, Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight } from 'lucide-react';
import { PhoneInput, OTPInput } from '../../components';
import {
  useRegisterStep1,
  useVerifyOTP,
  useCompleteProfile,
} from '../../hooks';
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
  PasswordStrength,
} from '../../components/ui';

type Step = 1 | 2 | 3;

/**
 * Custom Hook: useRegisterForm
 * Handles form state and validation logic
 */
function useRegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName) newErrors.fullName = 'الاسم الكامل مطلوب';
    if (!phone) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^\+963\d{9}$/.test(phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    fullName,
    setFullName,
    phone,
    setPhone,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    errors,
    validateStep1,
    validateStep3,
    router,
  };
}

/**
 * RegisterPage Component
 */
export function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [otp, setOtp] = useState('');

  const { sendOTP, sendOTPAsync, isLoading: isSendingOTP } = useRegisterStep1();
  const { verify, verifyAsync, isLoading: isVerifyingOTP } = useVerifyOTP();
  const { complete, isLoading: isCompletingProfile } = useCompleteProfile();

  const {
    fullName,
    setFullName,
    phone,
    setPhone,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    errors,
    validateStep1,
    validateStep3,
    router,
  } = useRegisterForm();

  // Step 1: Send OTP
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    try {
      await sendOTPAsync({
        fullName,
        phoneNumber: phone,
        countryCode: 'SY'
      });
      setStep(2); // Move to OTP verification
    } catch (error) {
      // Error handled by hook
    }
  };

  // Step 2: Verify OTP
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      return;
    }

    try {
      await verifyAsync({
        phoneNumber: phone,
        otp
      });
      setStep(3); // Move to complete profile
    } catch (error) {
      // Error handled by hook
    }
  };

  // Step 3: Complete Profile
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    complete({
      phoneNumber: phone,
      password,
      email: email || undefined
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 p-4 py-12 relative overflow-hidden"
      dir="rtl"
    >
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl relative z-10"
      >
        {/* Logo */}
        <Logo size="lg" />

        {/* Card */}
        <AuthCard>
          {/* Header */}
          <AuthHeader
            title={step === 1 ? "انضم إلينا!" : step === 2 ? "تحقق من رقم الهاتف" : "أكمل ملفك الشخصي"}
            subtitle={step === 1 ? "ابدأ تجربة تسوق فريدة وموفّرة" : step === 2 ? "أدخل رمز التحقق المرسل إلى هاتفك" : "قم بإنشاء كلمة المرور الخاصة بك"}
            emoji={step === 1 ? "🎉" : step === 2 ? "📱" : "🔐"}
          />

          {/* Form */}
          <div className="px-8 pb-8">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <FormField label="الاسم الكامل" required error={errors.fullName} delay={0.4}>
                  <StyledInput
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="أحمد محمد"
                    rightIcon={<User className="w-5 h-5" />}
                  />
                </FormField>

                {/* Phone Number */}
                <FormField label="رقم الهاتف" required error={errors.phone} delay={0.5}>
                  <StyledInput
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+963991234567"
                    dir="ltr"
                    rightIcon={<Phone className="w-5 h-5" />}
                  />
                </FormField>
              </div>

              {/* Submit Button */}
              <GradientButton
                type="submit"
                loading={isSendingOTP}
                loadingText="جاري الإرسال..."
                icon={<ArrowRight className="w-5 h-5" />}
                delay={0.6}
              >
                التالي - إرسال رمز التحقق
              </GradientButton>
            </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-center space-y-2 mb-6"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    أدخل رمز التحقق المرسل إلى
                  </p>
                  <p className="font-medium text-lg text-blue-600 dark:text-blue-400" dir="ltr">
                    {phone}
                  </p>
                </motion.div>

                <FormField label="رمز التحقق" required delay={0.4}>
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    onComplete={(value) => setOtp(value)}
                  />
                </FormField>

                <GradientButton
                  type="submit"
                  loading={isVerifyingOTP}
                  loadingText="جاري التحقق..."
                  icon={<ArrowRight className="w-5 h-5" />}
                  delay={0.6}
                  disabled={otp.length !== 6}
                >
                  التحقق والمتابعة
                </GradientButton>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center"
                >
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    ← العودة
                  </button>
                </motion.div>
              </form>
            )}

            {/* Step 3: Complete Profile */}
            {step === 3 && (
              <form onSubmit={handleStep3Submit} className="space-y-6">
                {/* Email (Optional) */}
                <FormField label="البريد الإلكتروني" optional error={errors.email} delay={0.4}>
                  <StyledInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmed@example.com"
                    dir="ltr"
                    rightIcon={<Mail className="w-5 h-5" />}
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

                {/* Confirm Password */}
                <FormField label="تأكيد كلمة السر" required error={errors.confirmPassword} delay={0.6}>
                  <StyledInput
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    rightIcon={<Lock className="w-5 h-5" />}
                    rightAction={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    }
                  />
                </FormField>

                {/* Password Requirements */}
                <PasswordStrength password={password} delay={0.7} />

                {/* Submit Button */}
                <GradientButton
                  type="submit"
                  loading={isCompletingProfile}
                  loadingText="جاري إنشاء الحساب..."
                  icon={<UserPlus className="w-5 h-5" />}
                  delay={0.8}
                >
                  إنشاء الحساب
                </GradientButton>
              </form>
            )}

            {/* Divider */}
            <AuthDivider />

            {/* Footer Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="space-y-3"
            >
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  لديك حساب؟{' '}
                  <Link
                    href="/auth/login"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1 group"
                  >
                    سجل دخول
                    <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>

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
        <PrivacyNotice text="بإنشاء حساب، أنت توافق على" delay={1.2} />
      </motion.div>
    </div>
  );
}

