'use client';

/**
 * PasswordInput Component
 * 
 * Password input with show/hide toggle and strength indicator
 */

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/forms';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  showStrength?: boolean;
  disabled?: boolean;
}

// Password strength calculation
const calculateStrength = (password: string): number => {
  let strength = 0;
  
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
  if (/\d/.test(password)) strength += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;
  
  return Math.min(strength, 100);
};

const getStrengthLabel = (strength: number): string => {
  if (strength === 0) return '';
  if (strength < 40) return 'ضعيفة';
  if (strength < 70) return 'متوسطة';
  return 'قوية';
};

const getStrengthColor = (strength: number): string => {
  if (strength === 0) return 'bg-gray-300';
  if (strength < 40) return 'bg-red-500';
  if (strength < 70) return 'bg-amber-500';
  return 'bg-green-500';
};

export const PasswordInput = ({
  value,
  onChange,
  error,
  label = 'كلمة المرور',
  placeholder = '••••••••',
  showStrength = false,
  disabled = false,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const strength = showStrength ? calculateStrength(value) : 0;
  const strengthLabel = getStrengthLabel(strength);
  const strengthColor = getStrengthColor(strength);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2">
      <Input
        type={showPassword ? 'text' : 'password'}
        label={label}
        value={value}
        onChange={handleChange}
        error={error}
        placeholder={placeholder}
        disabled={disabled}
        leftIcon={<Lock className="w-5 h-5" />}
        rightIcon={
          <button
            type="button"
            onClick={toggleShowPassword}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        }
      />
      
      {/* Password Strength Indicator */}
      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              قوة كلمة المرور:
            </span>
            <span className={`font-medium ${
              strength < 40 ? 'text-red-500' :
              strength < 70 ? 'text-amber-500' :
              'text-green-500'
            }`}>
              {strengthLabel}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strengthColor}`}
              style={{ width: `${strength}%` }}
            />
          </div>
          
          {/* Requirements */}
          {strength < 100 && (
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mt-2">
              {value.length < 8 && (
                <li>• يجب أن تحتوي على 8 أحرف على الأقل</li>
              )}
              {!/[a-z]/.test(value) || !/[A-Z]/.test(value) ? (
                <li>• يجب أن تحتوي على أحرف كبيرة وصغيرة</li>
              ) : null}
              {!/\d/.test(value) && (
                <li>• يجب أن تحتوي على رقم واحد على الأقل</li>
              )}
              {!/[!@#$%^&*(),.?":{}|<>]/.test(value) && (
                <li>• يُفضل أن تحتوي على رمز خاص (!@#$%...)</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

