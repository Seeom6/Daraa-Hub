'use client';

/**
 * PhoneInput Component
 * 
 * Input field for Syrian phone numbers (+963)
 */

import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { Input } from '@/components/ui/forms';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const PhoneInput = ({
  value,
  onChange,
  error,
  label = 'رقم الهاتف',
  placeholder = '991 234 567',
  disabled = false,
}: PhoneInputProps) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format phone number for display
  useEffect(() => {
    if (value) {
      // Remove +963 prefix if exists
      const cleaned = value.replace(/^\+963/, '').replace(/\D/g, '');
      setDisplayValue(cleaned);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove all non-digits
    const cleaned = input.replace(/\D/g, '');
    
    // Limit to 9 digits (Syrian mobile numbers)
    const limited = cleaned.slice(0, 9);
    
    // Update display value
    setDisplayValue(limited);
    
    // Update parent with +963 prefix
    if (limited) {
      onChange(`+963${limited}`);
    } else {
      onChange('');
    }
  };

  return (
    <div className="relative">
      <Input
        type="tel"
        label={label}
        value={displayValue}
        onChange={handleChange}
        error={error}
        placeholder={placeholder}
        disabled={disabled}
        leftIcon={<Phone className="w-5 h-5" />}
        dir="ltr"
        className="text-left"
      />
      
      {/* +963 Prefix Display */}
      <div className="absolute left-12 top-[38px] text-gray-500 dark:text-gray-400 pointer-events-none">
        +963
      </div>
    </div>
  );
};

