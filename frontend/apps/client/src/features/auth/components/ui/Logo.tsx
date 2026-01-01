'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Logo Component
 * 
 * Animated logo for auth pages
 */

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ size = 'lg' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-8 text-center"
    >
      <Link href="/" className="inline-block">
        <Image
          src="/logo.svg"
          alt="Sillap Logo"
          width={120}
          height={48}
          className={`${sizeClasses[size]} w-auto mx-auto`}
          priority
        />
      </Link>
    </motion.div>
  );
}

