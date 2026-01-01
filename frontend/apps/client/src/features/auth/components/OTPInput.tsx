'use client';

/**
 * OTPInput Component
 * 
 * Input fields for OTP verification (6 digits)
 */

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const OTPInput = ({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  disabled = false,
}: OTPInputProps) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Sync with external value only when it's cleared
  useEffect(() => {
    if (!value || value.length === 0) {
      setOtp(Array(length).fill(''));
    }
  }, [value, length]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const inputValue = e.target.value;

    // Only allow digits
    const digit = inputValue.replace(/[^0-9]/g, '');

    // If empty, clear the field
    if (!digit) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      onChange(newOtp.join(''));
      return;
    }

    // Take only the last digit if multiple were entered
    const lastDigit = digit.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = lastDigit;
    setOtp(newOtp);

    const otpValue = newOtp.join('');
    onChange(otpValue);

    // Auto-move to next input
    if (index < length - 1) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        setTimeout(() => {
          nextInput.focus();
        }, 10);
      }
    }

    // Call onComplete if all digits filled
    const filledCount = newOtp.filter(d => d !== '').length;
    if (filledCount === length && onComplete) {
      onComplete(otpValue);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    const target = e.target as HTMLInputElement;

    // Backspace: clear current and move to previous
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];

      if (otp[index]) {
        // Clear current field
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      } else if (index > 0) {
        // Move to previous field and clear it
        const prevInput = inputRefs.current[index - 1];
        if (prevInput) {
          newOtp[index - 1] = '';
          setOtp(newOtp);
          onChange(newOtp.join(''));
          prevInput.focus();
          prevInput.select();
        }
      }
    }

    // Delete: clear current field
    if (e.key === 'Delete') {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      onChange(newOtp.join(''));
    }

    // Arrow Left: move to previous
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }

    // Arrow Right: move to next
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }

    // If user types a number while field is filled, replace and move
    if (/^[0-9]$/.test(e.key) && otp[index]) {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = e.key;
      setOtp(newOtp);
      onChange(newOtp.join(''));

      // Move to next
      if (index < length - 1) {
        const nextInput = inputRefs.current[index + 1];
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);

    if (digits) {
      const newOtp = digits.split('').concat(Array(length).fill('')).slice(0, length);
      setOtp(newOtp);
      onChange(digits);

      // Focus last filled input or last input if all filled
      const lastIndex = Math.min(digits.length - 1, length - 1);
      setTimeout(() => {
        inputRefs.current[lastIndex]?.focus();
        inputRefs.current[lastIndex]?.select();
      }, 0);

      // Call onComplete if all digits filled
      if (digits.length === length && onComplete) {
        onComplete(digits);
      }
    }
  };

  // Auto-focus first input on mount
  useEffect(() => {
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  return (
    <div className="space-y-2" dir="ltr">
      <div className="flex gap-2 sm:gap-3 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            autoComplete="one-time-code"
            aria-label={`Digit ${index + 1}`}
            className={`
              w-11 h-12 sm:w-12 sm:h-14
              text-center text-xl sm:text-2xl font-bold
              bg-white dark:bg-gray-800
              border-2 rounded-lg
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text hover:border-blue-400'}
              ${digit ? 'border-blue-500 dark:border-blue-400' : ''}
            `}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center" role="alert">{error}</p>
      )}
    </div>
  );
};

