'use client';

import { Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 999,
  disabled = false,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const isMinReached = value <= min;
  const isMaxReached = value >= max;

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <label className="text-sm font-medium text-white">الكمية:</label>

      {/* Quantity Controls */}
      <div className="flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
        {/* Decrement Button */}
        <motion.button
          onClick={handleDecrement}
          disabled={disabled || isMinReached}
          whileHover={!disabled && !isMinReached ? { scale: 1.1 } : {}}
          whileTap={!disabled && !isMinReached ? { scale: 0.9 } : {}}
          className={`
            p-3 transition-colors
            ${
              disabled || isMinReached
                ? 'text-white/20 cursor-not-allowed'
                : 'text-white hover:bg-white/10'
            }
          `}
          aria-label="تقليل الكمية"
        >
          <Minus className="w-4 h-4" />
        </motion.button>

        {/* Input */}
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          min={min}
          max={max}
          className="
            w-16 text-center bg-transparent border-x border-white/10 
            text-white font-medium focus:outline-none
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />

        {/* Increment Button */}
        <motion.button
          onClick={handleIncrement}
          disabled={disabled || isMaxReached}
          whileHover={!disabled && !isMaxReached ? { scale: 1.1 } : {}}
          whileTap={!disabled && !isMaxReached ? { scale: 0.9 } : {}}
          className={`
            p-3 transition-colors
            ${
              disabled || isMaxReached
                ? 'text-white/20 cursor-not-allowed'
                : 'text-white hover:bg-white/10'
            }
          `}
          aria-label="زيادة الكمية"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Stock Info */}
      {max < 999 && (
        <span className="text-xs text-white/40">
          ({max} متوفر)
        </span>
      )}
    </div>
  );
}

