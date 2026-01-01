/**
 * Product Gallery Component
 * Image gallery with thumbnail navigation
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6"
      >
        <div className="aspect-square rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">لا توجد صور</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6"
    >
      {/* Main Image */}
      <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-slate-800 relative">
        <img
          src={images[selectedImage]}
          alt={productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-product.png';
          }}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                selectedImage === i
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <img
                src={img}
                alt={`${productName} ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-product.png';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

