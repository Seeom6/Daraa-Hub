'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import type { CartItem as CartItemType } from '../types/cart.types';

export interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  isUpdating?: boolean;
}

export function CartItem({ item, onQuantityChange, onRemove, isUpdating }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    const newQuantity = Math.max(1, value);
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  const itemTotal = item.price * quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
    >
      <div className="flex gap-4">
        {/* Product Image */}
        <Link
          href={`/products/${item.product.slug}`}
          className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white/10"
        >
          <Image
            src={item.product.mainImage || item.product.images[0] || '/placeholder.png'}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${item.product.slug}`}
            className="text-white font-medium hover:text-primary transition-colors line-clamp-2"
          >
            {item.product.name}
          </Link>

          {/* Variant Info */}
          {item.selectedVariant && (
            <div className="mt-1 text-sm text-white/60">
              {Object.entries(item.selectedVariant.options).map(([key, value]) => (
                <span key={key} className="mr-2">
                  {key}: {value}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {item.price.toLocaleString()} ل.س
            </span>
            {item.product.compareAtPrice && item.product.compareAtPrice > item.price && (
              <span className="text-sm text-white/40 line-through">
                {item.product.compareAtPrice.toLocaleString()} ل.س
              </span>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="mt-3 flex items-center gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1 || isUpdating}
                className="p-2 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4 text-white" />
              </button>

              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                disabled={isUpdating}
                className="w-12 text-center bg-transparent text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
              />

              <button
                onClick={handleIncrement}
                disabled={isUpdating}
                className="p-2 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={onRemove}
              disabled={isUpdating}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="حذف من السلة"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Item Total */}
            <div className="mr-auto text-right">
              <p className="text-sm text-white/60">المجموع</p>
              <p className="text-lg font-bold text-white">
                {itemTotal.toLocaleString()} ل.س
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

