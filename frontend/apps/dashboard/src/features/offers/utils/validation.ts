/**
 * Offers Validation Utilities
 * Validation functions for offer forms
 */

import type { OfferFormData } from '../types';

export function validateOfferStep(
  step: number,
  formData: OfferFormData
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (step === 1) {
    // Step 1: Basic Info
    if (!formData.title || formData.title.trim().length < 3) {
      errors.title = 'العنوان يجب أن يكون 3 أحرف على الأقل';
    }
    if (formData.title && formData.title.length > 100) {
      errors.title = 'العنوان يجب ألا يتجاوز 100 حرف';
    }
  }

  if (step === 2) {
    // Step 2: Discount
    if (!formData.discountType) {
      errors.discountType = 'يجب اختيار نوع الخصم';
    }

    const discountValue = parseFloat(formData.discountValue);
    if (!formData.discountValue || isNaN(discountValue) || discountValue <= 0) {
      errors.discountValue = 'قيمة الخصم يجب أن تكون أكبر من 0';
    }

    if (formData.discountType === 'percentage' && discountValue > 100) {
      errors.discountValue = 'النسبة المئوية يجب ألا تتجاوز 100%';
    }

    if (formData.minPurchaseAmount) {
      const minAmount = parseFloat(formData.minPurchaseAmount);
      if (isNaN(minAmount) || minAmount < 0) {
        errors.minPurchaseAmount = 'الحد الأدنى يجب أن يكون 0 أو أكثر';
      }
    }

    if (formData.maxDiscountAmount && formData.discountType === 'percentage') {
      const maxAmount = parseFloat(formData.maxDiscountAmount);
      if (isNaN(maxAmount) || maxAmount <= 0) {
        errors.maxDiscountAmount = 'الحد الأقصى يجب أن يكون أكبر من 0';
      }
    }
  }

  if (step === 3) {
    // Step 3: Products
    if (!formData.applyToAllProducts && formData.selectedProducts.length === 0) {
      errors.selectedProducts = 'يجب اختيار منتج واحد على الأقل';
    }
  }

  if (step === 4) {
    // Step 4: Schedule
    if (!formData.startDate) {
      errors.startDate = 'تاريخ البدء مطلوب';
    }
    if (!formData.endDate) {
      errors.endDate = 'تاريخ الانتهاء مطلوب';
    }
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        errors.endDate = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate complete offer data
 */
export function validateCompleteOffer(formData: OfferFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const allErrors: Record<string, string> = {};

  // Validate all steps
  for (let step = 1; step <= 4; step++) {
    const { errors } = validateOfferStep(step, formData);
    Object.assign(allErrors, errors);
  }

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
  };
}

