/**
 * Store Under Review Page
 * Displayed when vendor application is pending approval
 */

'use client';

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle,
  Mail,
  Phone,
  Home,
  Store,
  Shield,
  Award,
  ArrowLeft,
  Sparkles,
  FileText,
  Calendar
} from 'lucide-react';
import { getMyVerificationStatus } from '@/features/vendor/services/vendor.service';
import type { VerificationStatus } from '@/features/vendor/types/vendor.types';

export default function StoreUnderReview() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    loadStatus();
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const data = await getMyVerificationStatus();
      setStatus(data);
      
      // If approved, redirect to dashboard
      if (data?.status === 'approved') {
        window.location.href = 'http://localhost:3002/dashboard';
      }
    } catch (error) {
      console.error('Error loading status:', error);
    } finally {
      setLoading(false);
    }
  };

  const reviewSteps = [
    {
      id: 1,
      title: 'التحقق من البيانات',
      description: 'التحقق من صحة المعلومات المقدمة',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'مراجعة الوثائق',
      description: 'التأكد من اكتمال المستندات المطلوبة',
      icon: CheckCircle,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'الموافقة النهائية',
      description: 'موافقة الإدارة على تفعيل المتجر',
      icon: Award,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 4,
      title: 'تفعيل المتجر',
      description: 'إطلاق متجرك على المنصة',
      icon: Store,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لم يتم العثور على طلب</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">لم تقدم طلب بعد</p>
          <Link
            href="/become-vendor"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Store className="w-5 h-5" />
            تقديم طلب جديد
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-1 sm:p-4 relative overflow-hidden">
      {/* Animated Background - Only render on client to avoid hydration mismatch */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              }}
              animate={{
                y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
                x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>
      )}

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-4xl"
      >
        <div className="rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white text-center overflow-hidden">
            {isMounted && (
              <div className="absolute inset-0">
                {[...Array(15)].map((_, i) => {
                  const randomX = Math.random() * 100;
                  const randomY = Math.random() * 100;
                  const randomDelay = Math.random() * 2;
                  const randomRepeatDelay = Math.random() * 3;

                  return (
                    <motion.div
                      key={i}
                      className="absolute"
                      initial={{
                        x: `${randomX}%`,
                        y: `${randomY}%`,
                        scale: 0,
                        opacity: 0,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: randomDelay,
                        repeat: Infinity,
                        repeatDelay: randomRepeatDelay,
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  );
                })}
              </div>
            )}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative z-10 w-24 h-24 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl"
            >
              <Store className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl lg:text-4xl font-bold mb-3 relative z-10"
            >
              مرحباً بك في منصتنا! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/90 relative z-10"
            >
              شكراً لتسجيلك كصاحب متجر
            </motion.p>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-8 lg:p-12">
            {/* Status Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-8 sm:mb-12"
            >
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 border border-orange-200 dark:border-orange-800 mb-4 sm:mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                </motion.div>
                <span className="text-base sm:text-lg font-bold text-orange-800 dark:text-orange-300">
                  متجرك قيد المراجعة
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-2">
                نقوم حالياً بمراجعة طلبك
              </h2>

              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-2">
                يتم حالياً مراجعة معلومات متجرك والتحقق من البيانات المقدمة.
                ستستغرق عملية المراجعة <span className="font-bold text-blue-600 dark:text-blue-400">24 ساعة كحد أقصى</span>،
                وسنقوم بإعلامك فور الموافقة على متجرك.
              </p>

              {/* Application Details */}
              {!loading && status && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                  {/* Application ID - Full verification request ID */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">رقم الطلب:</span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-white break-all">
                      #{status._id}
                    </span>
                  </div>

                  {/* Submission Date */}
                  {status.submittedAt && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">تاريخ التقديم:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {new Date(status.submittedAt).toLocaleDateString('ar-SY', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Review Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8 sm:mb-12"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center px-2">
                مراحل المراجعة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {reviewSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === index;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="relative"
                    >
                      <div className={`rounded-2xl p-4 sm:p-6 border-2 transition-all duration-500 ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}>
                        <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r ${step.color} text-white font-bold mb-3 sm:mb-4 shadow-lg text-sm sm:text-base`}>
                          {step.id}
                        </div>

                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${
                          isActive
                            ? `bg-gradient-to-r ${step.color}`
                            : 'bg-gray-100 dark:bg-slate-700'
                        }`}>
                          <StepIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>

                        <h4 className={`font-bold mb-2 text-sm sm:text-base ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {step.title}
                        </h4>

                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {step.description}
                        </p>

                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg"
                          >
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                          </motion.div>
                        )}
                      </div>

                      {index < reviewSteps.length - 1 && (
                        <div className="hidden lg:block absolute top-1/2 left-full w-4 h-0.5 bg-gray-200 dark:bg-slate-700 -translate-y-1/2" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12"
            >
              {/* What's Next */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      ما التالي؟
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>سنراجع معلومات متجرك خلال 24 ساعة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>سنرسل إشعار عبر البريد الإلكتروني فور الموافقة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>يمكنك البدء بإضافة منتجاتك مباشرة</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      تواصل معنا
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      لديك أسئلة أو استفسارات؟ نحن هنا لمساعدتك
                    </p>
                    <div className="space-y-2">
                      <a
                        href="mailto:support@daraa.sy"
                        className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors break-all"
                      >
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        support@daraa.sy
                      </a>
                      <a
                        href="tel:+963991234567"
                        className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                      >
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        +963 991 234 567
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-center px-2"
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 group text-sm sm:text-base"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span>العودة إلى الصفحة الرئيسية</span>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>

              <p className="mt-4 sm:mt-6 text-sm text-gray-600 dark:text-gray-400">
                يمكنك متابعة تصفح المنصة بينما ننتظر الموافقة على متجرك
              </p>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              شكراً لاختيارك منصتنا لإطلاق متجرك الإلكتروني 💙
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl opacity-20 blur-xl"
        />

        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-8 -left-8 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-20 blur-xl"
        />
      </motion.div>
    </div>
  );
}

