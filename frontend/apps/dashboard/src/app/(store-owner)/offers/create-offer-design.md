import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Upload,
  Tag,
  Package,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StoreLayout } from '../../components/store/StoreLayout';
import { toast } from 'sonner@2.0.3';

const STEPS = [
  { number: 1, title: 'المعلومات الأساسية', icon: Tag },
  { number: 2, title: 'تفاصيل الخصم', icon: Tag },
  { number: 3, title: 'المنتجات المطبقة', icon: Package },
  { number: 4, title: 'الجدولة والتفعيل', icon: Calendar }
];

interface FormData {
  // Step 1
  title: string;
  description: string;
  image: File | null;
  imagePreview: string | null;
  
  // Step 2
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minPurchaseAmount: string;
  maxDiscountAmount: string;
  
  // Step 3
  applyToAllProducts: boolean;
  selectedProducts: string[];
  
  // Step 4
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function CreateOffer() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image: null,
    imagePreview: null,
    discountType: 'percentage',
    discountValue: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    applyToAllProducts: true,
    selectedProducts: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true
  });

  // Mock products
  const products = [
    { id: '1', name: 'لابتوب HP ProBook', price: 2500000, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200' },
    { id: '2', name: 'هاتف Samsung Galaxy S23', price: 1800000, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200' },
    { id: '3', name: 'سماعات Sony WH-1000XM5', price: 450000, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' },
    { id: '4', name: 'ساعة Apple Watch Series 9', price: 900000, image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=200' },
    { id: '5', name: 'كاميرا Canon EOS R6', price: 3200000, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200' },
    { id: '6', name: 'تابلت iPad Pro', price: 1400000, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200' }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        toast.error('يرجى إدخال عنوان العرض');
        return false;
      }
      if (formData.title.length < 3) {
        toast.error('العنوان يجب أن يكون 3 أحرف على الأقل');
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.discountValue) {
        toast.error('يرجى إدخال قيمة الخصم');
        return false;
      }
      const value = parseFloat(formData.discountValue);
      if (isNaN(value) || value <= 0) {
        toast.error('قيمة الخصم يجب أن تكون أكبر من 0');
        return false;
      }
      if (formData.discountType === 'percentage' && value > 100) {
        toast.error('النسبة المئوية يجب ألا تتجاوز 100%');
        return false;
      }
    }
    
    if (currentStep === 4) {
      if (!formData.startDate || !formData.endDate) {
        toast.error('يرجى تحديد تاريخ البدء والانتهاء');
        return false;
      }
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        toast.error('تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (validateStep()) {
      toast.success('تم إنشاء العرض بنجاح! 🎉');
      setTimeout(() => navigate('/store/offers'), 1500);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <StoreLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/store/offers')}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                إنشاء عرض جديد
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                املأ المعلومات التالية لإنشاء عرض ترويجي جديد
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-6 py-8">
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6 mb-8"
          >
            <div className="flex justify-between mb-6">
              {STEPS.map((step) => {
                const StepIcon = step.icon;
                const isCompleted = step.number < currentStep;
                const isCurrent = step.number === currentStep;
                
                return (
                  <div
                    key={step.number}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                      isCompleted
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                    </div>
                    <span className={`text-xs text-center font-medium ${
                      isCurrent
                        ? 'text-orange-600 dark:text-orange-400'
                        : isCompleted
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Form Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-8"
          >
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  المعلومات الأساسية
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    عنوان العرض <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: خصم 50% على جميع المنتجات"
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الوصف (اختياري)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="اكتب وصفاً تفصيلياً للعرض..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    صورة البانر (اختياري)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 transition-colors overflow-hidden">
                    {formData.imagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-medium">انقر لتغيير الصورة</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          انقر لرفع صورة أو اسحبها هنا
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          PNG, JPG, GIF (الحد الأقصى: 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Discount Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  تفاصيل الخصم
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    نوع الخصم <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.discountType === 'percentage'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">%</div>
                        <div className="font-medium text-gray-900 dark:text-white">نسبة مئوية</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">مثال: 25%</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.discountType === 'fixed'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">ل.س</div>
                        <div className="font-medium text-gray-900 dark:text-white">مبلغ ثابت</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">مثال: 50,000</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    قيمة الخصم <span className="text-red-500">*</span>
                    {formData.discountType === 'percentage' ? ' (%)' : ' (ل.س)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === 'percentage' ? 'مثال: 25' : 'مثال: 50000'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الحد الأدنى للشراء (ل.س) - اختياري
                  </label>
                  <input
                    type="number"
                    value={formData.minPurchaseAmount}
                    onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                    placeholder="مثال: 100000"
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    الحد الأدنى لقيمة الطلب لتطبيق العرض
                  </p>
                </div>

                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الحد الأقصى للخصم (ل.س) - اختياري
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      placeholder="مثال: 200000"
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      الحد الأقصى لقيمة الخصم (مفيد للنسب المئوية الكبيرة)
                    </p>
                  </div>
                )}

                {/* Preview */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">معاينة الخصم:</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {formData.discountType === 'percentage'
                      ? `خصم ${formData.discountValue}%`
                      : `خصم ${parseFloat(formData.discountValue || '0').toLocaleString('ar-SY')} ل.س`}
                  </p>
                  {formData.minPurchaseAmount && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      الحد الأدنى: {parseFloat(formData.minPurchaseAmount).toLocaleString('ar-SY')} ل.س
                    </p>
                  )}
                  {formData.maxDiscountAmount && formData.discountType === 'percentage' && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      الحد الأقصى: {parseFloat(formData.maxDiscountAmount).toLocaleString('ar-SY')} ل.س
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Products */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  المنتجات المطبقة
                </h2>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.applyToAllProducts}
                      onChange={(e) => setFormData({
                        ...formData,
                        applyToAllProducts: e.target.checked,
                        selectedProducts: e.target.checked ? [] : formData.selectedProducts
                      })}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        تطبيق على جميع المنتجات
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        سيتم تطبيق العرض على جميع منتجات المتجر
                      </div>
                    </div>
                  </label>
                </div>

                {!formData.applyToAllProducts && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      اختر المنتجات ({formData.selectedProducts.length} محدد)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products.map((product) => {
                        const isSelected = formData.selectedProducts.includes(product.id);
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                selectedProducts: isSelected
                                  ? formData.selectedProducts.filter(id => id !== product.id)
                                  : [...formData.selectedProducts, product.id]
                              });
                            }}
                            className={`p-4 rounded-xl border-2 transition-all text-right ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white mb-1">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {product.price.toLocaleString('ar-SY')} ل.س
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-6 h-6 text-orange-600" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Schedule */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  الجدولة والتفعيل
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      تاريخ البدء <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      تاريخ الانتهاء <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        تفعيل العرض فوراً
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        سيكون العرض مرئياً للعملاء فور الإنشاء
                      </div>
                    </div>
                  </label>
                </div>

                {/* Summary */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-200 dark:border-orange-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    ملخص العرض
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">العنوان:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formData.title || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">نوع الخصم:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formData.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">قيمة الخصم:</span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        {formData.discountType === 'percentage'
                          ? `${formData.discountValue}%`
                          : `${parseFloat(formData.discountValue || '0').toLocaleString('ar-SY')} ل.س`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">المنتجات:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formData.applyToAllProducts
                          ? 'جميع المنتجات'
                          : `${formData.selectedProducts.length} منتج`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">المدة:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formData.startDate && formData.endDate
                          ? `${new Date(formData.startDate).toLocaleDateString('ar-SA')} - ${new Date(formData.endDate).toLocaleDateString('ar-SA')}`
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
              <Button
                onClick={handleBack}
                disabled={currentStep === 1}
                variant="outline"
                className="px-6"
              >
                السابق
              </Button>

              {currentStep === STEPS.length ? (
                <Button
                  onClick={handleSubmit}
                  className="px-8 bg-gradient-to-r from-orange-600 to-pink-600 text-white hover:from-orange-700 hover:to-pink-700"
                >
                  <CheckCircle className="w-5 h-5 ml-2" />
                  إنشاء العرض
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="px-6 bg-gradient-to-r from-orange-600 to-pink-600 text-white hover:from-orange-700 hover:to-pink-700"
                >
                  التالي
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </StoreLayout>
  );
}