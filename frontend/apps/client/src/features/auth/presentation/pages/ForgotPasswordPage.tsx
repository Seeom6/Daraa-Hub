'use client';

/**
 * Forgot Password Page
 *
 * Multi-step password reset (3 steps)
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
import { Phone, Lock, Eye, EyeOff, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import { OTPInput } from '../../components';
import {
  useForgotPassword,
  useForgotPasswordVerifyOTP,
  useResetPassword,
} from '../../hooks';
import {
  AnimatedBackground,
  AuthCard,
  AuthHeader,
  FormField,
  GradientButton,
  PrivacyNotice,
  Logo,
  StyledInput,
  PasswordStrength,
} from '../../components/ui';

type Step = 1 | 2 | 3;

/**
 * Custom Hook: useForgotPasswordForm
 * Handles form state and validation logic
 */
function useForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhone = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!phone) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^\+963\d{9}$/.test(phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!otp || otp.length !== 6) {
      newErrors.otp = 'رمز التحقق يجب أن يكون 6 أرقام';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    step,
    setStep,
    phone,
    setPhone,
    otp,
    setOtp,
    resetToken,
    setResetToken,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    errors,
    setErrors,
    validatePhone,
    validateOTP,
    validatePassword,
    router,
  };
}

/**
 * ForgotPasswordPage Component
 */
export function ForgotPasswordPage() {
  const { sendOTP, isLoading: isSendingOTP } = useForgotPassword();
  const { verifyAsync, isLoading: isVerifying } = useForgotPasswordVerifyOTP();
  const { reset, isLoading: isResetting } = useResetPassword();

  const {
    step,
    setStep,
    phone,
    setPhone,
    otp,
    setOtp,
    setResetToken,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    errors,
    setErrors,
    validatePhone,
    validateOTP,
    validatePassword,
    router,
  } = useForgotPasswordForm();

  // Step 1: Send OTP
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validatePhone()) return;

    try {
      await sendOTP({ phone });
      setStep(2);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Step 2: Verify OTP
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateOTP()) return;

    try {
      const response = await verifyAsync({ phone, otp });
      setResetToken(response.resetToken);
      setStep(3);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Step 3: Reset Password
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validatePassword()) return;

    reset({
      phone,
      resetToken: 'temp-token', // Will be set from step 2
      newPassword,
    });
  };

  // Get step title and subtitle
  const getStepInfo = () => {
    switch (step) {
      case 1:
        return { title: 'نسيت كلمة السر؟', subtitle: 'أدخل رقم هاتفك لإرسال رمز التحقق', emoji: '🔐' };
      case 2:
        return { title: 'تحقق من هاتفك', subtitle: 'أدخل رمز التحقق المرسل إلى هاتفك', emoji: '📱' };
      case 3:
        return { title: 'كلمة سر جديدة', subtitle: 'أدخل كلمة المرور الجديدة', emoji: '🔑' };
    }
  };

  const stepInfo = getStepInfo();

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
            title={stepInfo.title}
            subtitle={stepInfo.subtitle}
            emoji={stepInfo.emoji}
          />

          {/* Steps Indicator */}
          <div className="px-8 pb-4">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                      : s < step
                      ? 'bg-blue-300 dark:bg-blue-700'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            {/* Step 1: Phone Number */}
            {step === 1 && (
              <form onSubmit={handleStep1} className="space-y-5">
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

                <GradientButton
                  type="submit"
                  loading={isSendingOTP}
                  loadingText="جاري الإرسال..."
                  icon={<KeyRound className="w-5 h-5" />}
                  delay={0.5}
                >
                  إرسال رمز التحقق
                </GradientButton>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleStep2} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-center space-y-2 mb-6"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    أدخل رمز التحقق المرسل إلى
                  </p>
                  <p className="font-medium text-lg text-blue-600 dark:text-blue-400" dir="ltr">
                    {phone}
                  </p>
                </motion.div>

                <FormField label="رمز التحقق" required error={errors.otp} delay={0.5}>
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    onComplete={(value) => setOtp(value)}
                    error={errors.otp}
                  />
                </FormField>

                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setStep(1)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex-1 h-14 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-medium transition-all hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    رجوع
                  </motion.button>

                  <GradientButton
                    type="submit"
                    loading={isVerifying}
                    loadingText="جاري التحقق..."
                    icon={<KeyRound className="w-5 h-5" />}
                    delay={0.7}
                  >
                    تحقق
                  </GradientButton>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleStep3} className="space-y-5">
                <FormField label="كلمة السر الجديدة" required error={errors.newPassword} delay={0.4}>
                  <StyledInput
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

                <FormField label="تأكيد كلمة السر" required error={errors.confirmPassword} delay={0.5}>
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

                <PasswordStrength password={newPassword} delay={0.6} />

                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setStep(2)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="flex-1 h-14 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-medium transition-all hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    رجوع
                  </motion.button>

                  <GradientButton
                    type="submit"
                    loading={isResetting}
                    loadingText="جاري التغيير..."
                    icon={<KeyRound className="w-5 h-5" />}
                    delay={0.8}
                  >
                    تغيير كلمة السر
                  </GradientButton>
                </div>
              </form>
            )}

            {/* Footer Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="space-y-3 pt-6"
            >
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  تذكرت كلمة السر؟{' '}
                  <Link
                    href="/auth/login"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1 group"
                  >
                    سجل دخول
                    <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
        <PrivacyNotice text="استعادة كلمة السر تعني موافقتك على" delay={1.0} />
      </motion.div>
    </div>
  );
}

