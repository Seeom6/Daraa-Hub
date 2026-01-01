'use client';

import Image from 'next/image';
import { motion } from 'motion/react';

export interface VariantOption {
  value: string;
  label: string;
  available: boolean;
  image?: string;
  colorCode?: string; // For color variants
}

export interface Variant {
  name: string; // e.g., "اللون", "الحجم"
  key: string; // e.g., "color", "size"
  options: VariantOption[];
}

export interface ProductVariantsProps {
  variants: Variant[];
  selected: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function ProductVariants({
  variants,
  selected,
  onChange,
}: ProductVariantsProps) {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {variants.map((variant) => (
        <div key={variant.key} className="space-y-3">
          {/* Variant Label */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white">
              {variant.name}
            </label>
            {selected[variant.key] && (
              <span className="text-sm text-white/60">
                {
                  variant.options.find((opt) => opt.value === selected[variant.key])
                    ?.label
                }
              </span>
            )}
          </div>

          {/* Variant Options */}
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => {
              const isSelected = selected[variant.key] === option.value;
              const isDisabled = !option.available;

              // Color variant with color code
              if (option.colorCode) {
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => !isDisabled && onChange(variant.key, option.value)}
                    disabled={isDisabled}
                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    className={`
                      relative w-12 h-12 rounded-lg border-2 transition-all
                      ${isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-white/20'}
                      ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-white/40 cursor-pointer'}
                    `}
                    title={option.label}
                  >
                    <div
                      className="w-full h-full rounded-md"
                      style={{ backgroundColor: option.colorCode }}
                    />
                    {isDisabled && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-white/60 rotate-45" />
                      </div>
                    )}
                  </motion.button>
                );
              }

              // Image variant
              if (option.image) {
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => !isDisabled && onChange(variant.key, option.value)}
                    disabled={isDisabled}
                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    className={`
                      relative w-16 h-16 rounded-lg border-2 overflow-hidden transition-all
                      ${isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-white/20'}
                      ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-white/40 cursor-pointer'}
                    `}
                    title={option.label}
                  >
                    <Image
                      src={option.image}
                      alt={option.label}
                      fill
                      className="object-cover"
                    />
                    {isDisabled && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-white/60 rotate-45" />
                      </div>
                    )}
                  </motion.button>
                );
              }

              // Text variant (default)
              return (
                <motion.button
                  key={option.value}
                  onClick={() => !isDisabled && onChange(variant.key, option.value)}
                  disabled={isDisabled}
                  whileHover={!isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  className={`
                    px-4 py-2 rounded-lg border transition-all text-sm font-medium
                    ${
                      isSelected
                        ? 'bg-primary border-primary text-white'
                        : 'bg-white/5 border-white/20 text-white hover:border-white/40'
                    }
                    ${isDisabled ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}
                  `}
                >
                  {option.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

