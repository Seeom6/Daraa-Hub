/**
 * useBecomeVendor Hook
 * Manages vendor application form state and submission
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { submitVendorApplication, uploadMultipleFiles, uploadFile } from '../services/vendor.service';
import type { BecomeVendorFormData, BecomeVendorRequest } from '../types/vendor.types';

interface FormErrors {
  [key: string]: string;
}

export function useBecomeVendor() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<BecomeVendorFormData>({
    storeName: '',
    storeDescription: '',
    primaryCategory: '',
    storeCategories: [],
    businessLicense: '',
    taxId: '',
    nationalId: '',
    businessAddress: '',
    businessPhone: '',
    dateOfBirth: '',
    storeImages: [],
    businessLicensePdf: undefined,
    taxCertificatePdf: undefined,
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Update a single field
   */
  const updateField = (field: keyof BecomeVendorFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Validate Step 1: Store Information
   */
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.storeName.trim()) {
      newErrors.storeName = 'اسم المتجر مطلوب';
    } else if (formData.storeName.length < 3) {
      newErrors.storeName = 'اسم المتجر يجب أن يكون 3 أحرف على الأقل';
    }

    if (!formData.storeDescription.trim()) {
      newErrors.storeDescription = 'وصف المتجر مطلوب';
    } else if (formData.storeDescription.length < 20) {
      newErrors.storeDescription = 'الوصف يجب أن يكون 20 حرف على الأقل';
    }

    if (!formData.primaryCategory) {
      newErrors.primaryCategory = 'التصنيف الرئيسي مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validate Step 2: Business Information
   */
  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'رقم الهوية الوطنية مطلوب';
    }

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'تاريخ الميلاد مطلوب';
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = 'عنوان العمل مطلوب';
    }

    if (!formData.businessPhone.trim()) {
      newErrors.businessPhone = 'رقم هاتف العمل مطلوب';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.businessPhone.replace(/\s/g, ''))) {
      newErrors.businessPhone = 'رقم الهاتف غير صحيح';
    }

    // Validate store images (minimum 3 images)
    if (!formData.storeImages || formData.storeImages.length < 3) {
      newErrors.storeImages = 'يجب رفع 3 صور على الأقل للمحل التجاري';
    }

    // Validate image file types
    if (formData.storeImages && formData.storeImages.length > 0) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const invalidImages = formData.storeImages.filter(
        (file) => !validImageTypes.includes(file.type)
      );
      if (invalidImages.length > 0) {
        newErrors.storeImages = 'يجب أن تكون الصور بصيغة JPG أو PNG أو WEBP';
      }
    }

    // Validate PDF files if provided
    if (formData.businessLicensePdf && formData.businessLicensePdf.type !== 'application/pdf') {
      newErrors.businessLicensePdf = 'يجب أن تكون رخصة العمل بصيغة PDF';
    }

    if (formData.taxCertificatePdf && formData.taxCertificatePdf.type !== 'application/pdf') {
      newErrors.taxCertificatePdf = 'يجب أن تكون الشهادة الضريبية بصيغة PDF';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validate Step 3: Terms Agreement
   */
  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'يجب الموافقة على الشروط والأحكام';
      toast.error('يجب الموافقة على الشروط والأحكام للمتابعة');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validate current step
   */
  const validateStep = (step: number): boolean => {
    if (step === 1) return validateStep1();
    if (step === 2) return validateStep2();
    if (step === 3) return validateStep3();
    return false;
  };

  /**
   * Submit vendor application
   */
  const submitApplication = async () => {
    try {
      setIsSubmitting(true);

      // Upload store images
      toast.loading('جاري رفع صور المحل...', { id: 'upload-images' });
      const storeImageUrls = await uploadMultipleFiles(formData.storeImages, 'image');
      toast.success('تم رفع الصور بنجاح', { id: 'upload-images' });

      // Upload PDFs if provided
      let businessLicensePdfUrl: string | undefined;
      let taxCertificatePdfUrl: string | undefined;

      if (formData.businessLicensePdf) {
        toast.loading('جاري رفع رخصة العمل...', { id: 'upload-license' });
        businessLicensePdfUrl = await uploadFile(formData.businessLicensePdf, 'pdf');
        toast.success('تم رفع رخصة العمل بنجاح', { id: 'upload-license' });
      }

      if (formData.taxCertificatePdf) {
        toast.loading('جاري رفع الشهادة الضريبية...', { id: 'upload-tax' });
        taxCertificatePdfUrl = await uploadFile(formData.taxCertificatePdf, 'pdf');
        toast.success('تم رفع الشهادة الضريبية بنجاح', { id: 'upload-tax' });
      }

      // Build request payload
      toast.loading('جاري إرسال الطلب...', { id: 'submit-request' });
      const request: BecomeVendorRequest = {
        applicantType: 'store_owner',
        personalInfo: {
          fullName: '', // Will be filled from current user account
          nationalId: formData.nationalId,
          dateOfBirth: formData.dateOfBirth || '2000-01-01', // Default if not provided
          address: formData.businessAddress,
          city: 'درعا', // Default city
        },
        businessInfo: {
          businessName: formData.storeName,
          businessType: formData.primaryCategory,
          businessAddress: formData.businessAddress,
          businessPhone: formData.businessPhone,
          taxId: formData.taxId || undefined,
          commercialRegister: formData.businessLicense || undefined,
          primaryCategory: formData.primaryCategory,
          storeCategories: formData.storeCategories,
          storeImages: storeImageUrls,
          businessLicensePdf: businessLicensePdfUrl,
          taxCertificatePdf: taxCertificatePdfUrl,
        },
        additionalNotes: formData.storeDescription,
      };

      const response = await submitVendorApplication(request);

      if (response.success) {
        toast.success('تم إرسال طلبك بنجاح! سيتم مراجعته قريباً.', { id: 'submit-request' });
        // Redirect to dashboard under review page
        router.push('/store-under-review');
        //  window.location.href = 'http://localhost:3000/store-under-review';
      } else {
        toast.error(response.message || 'حدث خطأ أثناء إرسال الطلب', { id: 'submit-request' });
      }
    } catch (error: any) {
      console.error('Error submitting vendor application:', error);
      toast.error(error.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    updateField,
    errors,
    validateStep,
    submitApplication,
    isSubmitting,
  };
}

