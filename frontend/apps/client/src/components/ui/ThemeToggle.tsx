'use client';

/**
 * Theme Toggle Button
 * 
 * Toggles between light and dark mode
 * Shows sun icon in dark mode, moon icon in light mode
 */

import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

export function ThemeToggle() {
  const { actualTheme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: actualTheme === 'dark' ? 180 : 0,
          scale: actualTheme === 'dark' ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Sun className="w-5 h-5 text-yellow-500" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          rotate: actualTheme === 'light' ? 180 : 0,
          scale: actualTheme === 'light' ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Moon className="w-5 h-5 text-blue-500" />
      </motion.div>
    </motion.button>
  );
}

