/**
 * useVendorStatus Hook
 * Checks vendor application status and handles redirects
 */

'use client';

import { useEffect, useState } from 'react';
import { getMyVerificationStatus } from '../services/vendor.service';
import type { VerificationStatus } from '../types/vendor.types';

export function useVendorStatus() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const data = await getMyVerificationStatus();
      setStatus(data);
    } catch (error) {
      console.error('Error checking vendor status:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user can apply (no pending application)
   */
  const canApply = (): boolean => {
    if (!status) return true;

    // Can apply if rejected
    if (status.status === 'rejected') return true;

    // Cannot apply if pending, under_review, info_required, or approved
    return false;
  };

  /**
   * Redirect to appropriate page based on status
   */
  const redirectBasedOnStatus = () => {
    if (!status) return;

    // If approved, redirect to dashboard
    if (status.status === 'approved') {
      window.location.href = 'http://localhost:3002/dashboard';
      return;
    }

    // If pending, under_review, or info_required, redirect to status page
    if (['pending', 'under_review', 'info_required'].includes(status.status)) {
      window.location.href = '/store-under-review';
      return;
    }

    // If rejected, allow to stay on application page
  };

  return {
    status,
    loading,
    canApply,
    redirectBasedOnStatus,
    refetch: checkStatus,
  };
}
