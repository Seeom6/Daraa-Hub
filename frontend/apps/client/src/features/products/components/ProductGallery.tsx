'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

export interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleImageClick = () => {
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center">
        <p className="text-white/40">لا توجد صور</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
            >
              <Image
                src={images[selectedIndex]}
                alt={`${productName} - ${selectedIndex + 1}`}
                fill
                className="object-contain p-4"
                priority={selectedIndex === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Zoom Button */}
          <button
            onClick={handleImageClick}
            className="absolute top-4 left-4 ltr:left-auto ltr:right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="تكبير الصورة"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute right-4 ltr:right-auto ltr:left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="الصورة السابقة"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute left-4 ltr:left-auto ltr:right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="الصورة التالية"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`
                  relative aspect-square bg-white/5 backdrop-blur-sm rounded-lg border overflow-hidden
                  transition-all duration-200
                  ${
                    index === selectedIndex
                      ? 'border-primary ring-2 ring-primary/50'
                      : 'border-white/10 hover:border-white/30'
                  }
                `}
              >
                <Image
                  src={image}
                  alt={`${productName} - thumbnail ${index + 1}`}
                  fill
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 ltr:right-auto ltr:left-4 bg-white/10 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Lightbox Image */}
            <div
              className="relative max-w-7xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedIndex]}
                alt={`${productName} - ${selectedIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Lightbox Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute right-4 ltr:right-auto ltr:left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="الصورة السابقة"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute left-4 ltr:left-auto ltr:right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="الصورة التالية"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

