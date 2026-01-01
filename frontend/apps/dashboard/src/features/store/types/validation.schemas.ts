/**
 * Validation Schemas
 * Zod schemas for form validation
 */

import { z } from 'zod';

// ===== Store Setup Validation =====

export const storeInfoSchema = z.object({
  storeName: z.string().min(3, 'اسم المتجر يجب أن يكون 3 أحرف على الأقل'),
  storeDescription: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  primaryCategory: z.string().min(1, 'الرجاء اختيار الفئة الرئيسية'),
  storeCategories: z.array(z.string()).max(3, 'الحد الأقصى 3 فئات'),
});

export const businessInfoSchema = z.object({
  businessName: z.string().min(3, 'اسم النشاط التجاري مطلوب'),
  businessType: z.string().min(3, 'نوع النشاط التجاري مطلوب'),
  businessAddress: z.string().min(10, 'العنوان الكامل مطلوب'),
  city: z.string().min(1, 'المدينة مطلوبة'),
  businessPhone: z.string().regex(/^\+963\d{9}$/, 'رقم هاتف سوري غير صالح'),
  taxId: z.string().optional(),
  commercialRegister: z.string().optional(),
});

export const personalInfoSchema = z.object({
  fullName: z.string().min(3, 'الاسم الكامل مطلوب'),
  nationalId: z.string().min(11, 'الرقم الوطني صالح مطلوب'),
  dateOfBirth: z.string().min(1, 'تاريخ الميلاد مطلوب'),
  address: z.string().min(10, 'العنوان الكامل مطلوب'),
});

// ===== Product Validation =====

export const productSchema = z.object({
  name: z.string().min(3, 'اسم المنتج يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().min(20, 'الوصف يجب أن يكون 20 حرف على الأقل'),
  category: z.string().min(1, 'الفئة مطلوبة'),
  price: z.number().min(0, 'السعر يجب أن يكون موجباً'),
  compareAtPrice: z.number().min(0).optional(),
  sku: z.string().optional(),
  images: z.array(z.any()).min(1, 'صورة واحدة على الأقل مطلوبة'),
  isActive: z.boolean(),
});

// ===== Settings Validation =====

export const settingsSchema = z.object({
  defaultShippingFee: z.number().min(0, 'رسوم الشحن يجب أن تكون موجبة'),
  freeShippingThreshold: z.number().min(0, 'حد الشحن المجاني يجب أن يكون موجباً'),
  minOrderAmount: z.number().min(0, 'الحد الأدنى للطلب يجب أن يكون موجباً'),
  orderCancellationPeriod: z.number().min(0, 'فترة الإلغاء يجب أن تكون موجبة'),
  returnPeriod: z.number().min(0, 'فترة الإرجاع يجب أن تكون موجبة'),
});

