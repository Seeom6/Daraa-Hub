'use client';

/**
 * Hero Banner Component
 * Main banner carousel for home page
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Carousel } from '@/components/ui/Carousel';
import { cn } from '@/lib/utils';
import type { Banner } from '@/features/shared/types';

export interface HeroBannerProps {
  banners: Banner[];
  autoPlay?: boolean;
  interval?: number;
}

export function HeroBanner({
  banners,
  autoPlay = true,
  interval = 5000,
}: HeroBannerProps) {
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden group">
      <Carousel
        autoPlay={autoPlay}
        interval={interval}
        showDots={banners.length > 1}
        showArrows={banners.length > 1}
        className="h-full"
      >
        {banners.map((banner) => (
          <BannerSlide key={banner._id} banner={banner} />
        ))}
      </Carousel>
    </div>
  );
}

interface BannerSlideProps {
  banner: Banner;
}

function BannerSlide({ banner }: BannerSlideProps) {
  const [imageError, setImageError] = useState(false);

  const content = (
    <div className="relative w-full h-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageError ? '/images/placeholder-banner.png' : banner.image}
          alt={banner.title}
          fill
          className="object-cover"
          priority
          onError={() => setImageError(true)}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            {/* Subtitle */}
            {banner.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-primary-400 font-medium mb-2 text-sm md:text-base"
              >
                {banner.subtitle}
              </motion.p>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4"
            >
              {banner.title}
            </motion.h1>

            {/* Description */}
            {banner.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-gray-200 text-base md:text-lg mb-6 max-w-xl"
              >
                {banner.description}
              </motion.p>
            )}

            {/* CTA Button */}
            {banner.buttonText && banner.link && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link
                  href={banner.link}
                  className={cn(
                    'inline-flex items-center justify-center',
                    'bg-primary-600 hover:bg-primary-700',
                    'text-white font-semibold',
                    'px-8 py-3 rounded-lg',
                    'transition-all duration-200',
                    'hover:shadow-lg hover:scale-105'
                  )}
                >
                  {banner.buttonText}
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );

  // If banner has a link but no button text, make the whole slide clickable
  if (banner.link && !banner.buttonText) {
    return (
      <Link href={banner.link} className="block w-full h-full">
        {content}
      </Link>
    );
  }

  return content;
}

