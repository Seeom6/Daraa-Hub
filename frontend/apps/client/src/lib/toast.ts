/**
 * Toast Utilities
 * 
 * Helper functions for showing toast notifications
 */

import toast from 'react-hot-toast';

/**
 * Show success toast
 */
export const showSuccess = (message: string) => {
  return toast.success(message);
};

/**
 * Show error toast
 */
export const showError = (message: string) => {
  return toast.error(message);
};

/**
 * Show loading toast
 */
export const showLoading = (message: string) => {
  return toast.loading(message);
};

/**
 * Show info toast
 */
export const showInfo = (message: string) => {
  return toast(message, {
    icon: 'ℹ️',
  });
};

/**
 * Dismiss toast
 */
export const dismissToast = (toastId?: string) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

/**
 * Promise toast - shows loading, then success or error
 */
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, messages);
};

export default {
  success: showSuccess,
  error: showError,
  loading: showLoading,
  info: showInfo,
  dismiss: dismissToast,
  promise: showPromise,
};

