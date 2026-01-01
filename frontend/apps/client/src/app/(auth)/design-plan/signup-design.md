// 📝 صفحة التسجيل
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Phone, Mail, Lock, Eye, EyeOff, UserPlus, Loader2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { signup } from '../../services/authService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Logo from '../../components/Logo';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // محاكاة التحميل فقط
    setTimeout(() => {
      // الانتقال إلى صفحة تأكيد OTP
      navigate('/auth/verify-otp', { 
        state: { 
          phoneNumber: formData.phoneNumber || '+963991234567'
        } 
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 p-4 py-12 relative overflow-hidden" dir="rtl">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-400 to-purple-600 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Logo size="lg" />
        </motion.div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 pb-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h1 className="text-2xl mb-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                انضم إلينا! 🎉
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                ابدأ تجربة تسوق فريدة وموفّرة
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Error Message */}
              {/* تم إزالة رسائل الخطأ */}

              {/* Two Column Layout for Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Full Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="space-y-2"
                >
                  <label className="text-sm text-gray-700 dark:text-gray-300 block">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="أحمد محمد"
                      className="pr-12 h-14 bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </motion.div>

                {/* Phone Number */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="text-sm text-gray-700 dark:text-gray-300 block">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+963991234567"
                      className="pr-12 h-14 bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      dir="ltr"
                    />
                  </div>
                </motion.div>

                {/* Email (Full Width) */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="space-y-2 md:col-span-2"
                >
                  <label className="text-sm text-gray-700 dark:text-gray-300 block">
                    البريد الإلكتروني <span className="text-gray-400 text-xs">(اختياري)</span>
                  </label>
                  <div className="relative group">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ahmed@example.com"
                      className="pr-12 h-14 bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      dir="ltr"
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="space-y-2"
                >
                  <label className="text-sm text-gray-700 dark:text-gray-300 block">
                    كلمة السر <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pr-12 pl-12 h-14 bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                {/* Confirm Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="space-y-2"
                >
                  <label className="text-sm text-gray-700 dark:text-gray-300 block">
                    تأكيد كلمة السر <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pr-12 pl-12 h-14 bg-gray-50/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Password Requirements */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4"
              >
                <p className="text-xs text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  متطلبات كلمة السر:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center ${formData.password.length >= 8 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'} transition-all`}>
                      ✓
                    </span>
                    <span className={`text-xs ${formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                      8 أحرف على الأقل
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center ${/[A-Z]/.test(formData.password) ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'} transition-all`}>
                      ✓
                    </span>
                    <span className={`text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                      حرف كبير
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center ${/[a-z]/.test(formData.password) ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'} transition-all`}>
                      ✓
                    </span>
                    <span className={`text-xs ${/[a-z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                      حرف صغير
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center ${/[0-9]/.test(formData.password) ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'} transition-all`}>
                      ✓
                    </span>
                    <span className={`text-xs ${/[0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                      رقم واحد
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all rounded-2xl text-base relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 ml-2" />
                      إنشاء الحساب
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white/80 dark:bg-slate-900/80 text-gray-500 dark:text-gray-400">
                  أو
                </span>
              </div>
            </div>

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
                    to="/auth/login"
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
                  onClick={() => navigate('/')}
                  className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline decoration-dotted underline-offset-4 transition-colors"
                >
                  المتابعة كزائر
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-500">
            بإنشاء حساب، أنت توافق على{' '}
            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">الشروط والأحكام</span>
            {' '}و{' '}
            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">سياسة الخصوصية</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}