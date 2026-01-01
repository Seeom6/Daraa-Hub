/**
 * useLoginForm Hook
 * Application layer hook for login form
 */

'use client';

import { useState } from 'react';
import { useLogin } from '@daraa/state';
import { LoginUseCase } from '@daraa/core';
import type { LoginRequest } from '@daraa/types';

export function useLoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const loginMutation = useLogin();

  const handleSubmit = async (data: LoginRequest) => {
    // Validate
    const validation = LoginUseCase.validate(data);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Clear errors
    setErrors({});

    // Submit
    try {
      await loginMutation.mutateAsync(data);
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || 'حدث خطأ' });
    }
  };

  return {
    handleSubmit,
    errors,
    isLoading: loginMutation.isPending,
    isSuccess: loginMutation.isSuccess,
  };
}

