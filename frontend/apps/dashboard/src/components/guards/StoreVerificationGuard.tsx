/**
 * Store Verification Guard
 * Protects routes that require an approved store
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { storeOwnerService } from '@/features/store/services';
import type { StoreOwnerProfile } from '@/features/store/types';

interface StoreVerificationGuardProps {
  children: React.ReactNode;
  requireApproved?: boolean; // If true, requires approved status
}

export function StoreVerificationGuard({ 
  children, 
  requireApproved = true 
}: StoreVerificationGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkStoreStatus();
  }, []);

  const checkStoreStatus = async () => {
    try {
      const profile: StoreOwnerProfile = await storeOwnerService.getProfile();

      // Check if profile exists
      if (!profile || !profile._id) {
        toast.error('لم يتم العثور على معرف المتجر. الرجاء إنشاء ملف المتجر أولاً', {
          duration: 5000,
        });
        setTimeout(() => {
          router.push('/settings/profile');
        }, 2000);
        return;
      }

      // If we require approved status
      if (requireApproved) {
        // Check verification status
        if (profile.verificationStatus === 'pending') {
          toast.error('متجرك قيد المراجعة. يرجى انتظار الموافقة', {
            duration: 6000,
          });
          setTimeout(() => {
            router.push('/store-under-review');
          }, 2000);
          return;
        }

        if (profile.verificationStatus === 'rejected') {
          toast.error('تم رفض طلب التحقق من متجرك. يرجى مراجعة الملاحظات وإعادة التقديم', {
            duration: 6000,
          });
          setTimeout(() => {
            router.push('/settings/verification');
          }, 2000);
          return;
        }

        if (profile.verificationStatus === 'suspended') {
          toast.error('متجرك معلق حالياً. يرجى التواصل مع الدعم الفني', {
            duration: 6000,
          });
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
          return;
        }

        // Check if store is active
        if (!profile.isStoreActive) {
          toast.error('متجرك غير نشط حالياً. يرجى تفعيل المتجر أولاً', {
            duration: 5000,
          });
          setTimeout(() => {
            router.push('/settings/profile');
          }, 2000);
          return;
        }

        // All checks passed - store is approved and active
        if (profile.verificationStatus === 'approved') {
          setIsAuthorized(true);
        } else {
          toast.error('حالة المتجر غير صحيحة. يرجى التواصل مع الدعم الفني');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      } else {
        // Don't require approved status - just check if profile exists
        setIsAuthorized(true);
      }
    } catch (error: any) {
      console.error('Error checking store status:', error);

      if (error.response?.status === 404) {
        toast.error('لم يتم العثور على ملف المتجر. الرجاء إنشاء ملف المتجر أولاً', {
          duration: 5000,
        });
        setTimeout(() => {
          router.push('/settings/profile');
        }, 2000);
      } else if (error.response?.status === 401) {
        toast.error('يجب تسجيل الدخول أولاً');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        toast.error('فشل تحميل معلومات المتجر. الرجاء المحاولة مرة أخرى');
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحقق من حالة المتجر...</p>
        </div>
      </div>
    );
  }

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null;
}

