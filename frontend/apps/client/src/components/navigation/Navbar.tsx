/**
 * Navbar Component
 * Main navigation bar with glassmorphism effect
 * Responsive with mobile menu support
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Home,
  Heart,
  Package,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { useLogout } from '@/features/auth/hooks';
import { Badge } from '@daraa/ui';
import { MainContainer } from '../containers';
import { NotificationDropdown } from '@/features/notifications/components';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavbarProps {
  cartItemsCount?: number;
}

export function Navbar({ cartItemsCount = 0 }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const { logout } = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCartClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      router.push('/cart');
    }
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      router.push('/auth/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-gray-200/50 dark:border-slate-800/50">
        <MainContainer>
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image
                src="/logo.svg"
                alt="Sillap Logo"
                width={120}
                height={48}
                className="h-10 sm:h-12 w-auto"
                priority
              />
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="ابحث عن المنتجات..."
                  className="w-full h-11 pr-11 pl-4 bg-gray-100 dark:bg-slate-900 border-0 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                )}
              </button>

              {/* Theme Toggle - Desktop Only */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {/* Notifications - Desktop Only (Authenticated) */}
              {isAuthenticated && (
                <div className="hidden sm:block">
                  <NotificationDropdown />
                </div>
              )}

              {/* Cart - Desktop Only */}
              <button
                onClick={handleCartClick}
                className="hidden sm:flex relative w-10 h-10 rounded-full items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                {isAuthenticated && cartItemsCount > 0 && (
                  <Badge
                    variant="primary"
                    size="sm"
                    className="absolute -top-1 -left-1 w-5 h-5 p-0"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
              </button>

              {/* Profile / Login - Desktop Only */}
              {!isLoading && (
                isAuthenticated ? (
                  <button
                    onClick={handleProfileClick}
                    className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                  </button>
                ) : (
                  <Link href="/auth/login">
                    <button className="hidden sm:flex h-10 px-4 items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      تسجيل الدخول
                    </button>
                  </Link>
                )
              )}
            </div>
          </div>
        </MainContainer>
      </nav>

      {/* Mobile Menu Dropdown */}
      <MobileMenuDropdown
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        cartItemsCount={cartItemsCount}
        pathname={pathname}
        onCartClick={handleCartClick}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
      />
    </>
  );
}

// Mobile Menu Dropdown Props
interface MobileMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  cartItemsCount: number;
  pathname: string;
  onCartClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

// Mobile Menu Dropdown Component
function MobileMenuDropdown({
  isOpen,
  onClose,
  isAuthenticated,
  cartItemsCount,
  pathname,
  onCartClick,
  onProfileClick,
  onLogout,
}: MobileMenuDropdownProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="sm:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden fixed top-20 left-4 right-4 z-50"
          >
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
              {/* Search Bar - Mobile */}
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <div className="relative w-full">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="search"
                    placeholder="ابحث عن المنتجات..."
                    className="w-full h-11 pr-11 pl-4 bg-gray-100 dark:bg-slate-800 border-0 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-1">
                {/* Home */}
                <MobileMenuItem
                  icon={<Home className="w-5 h-5 text-blue-500" />}
                  label="الرئيسية"
                  isActive={pathname === '/'}
                  onClick={() => {
                    router.push('/');
                    onClose();
                  }}
                />

                {/* Cart */}
                <MobileMenuItem
                  icon={
                    <div className="relative">
                      <ShoppingCart className="w-5 h-5 text-purple-500" />
                      {isAuthenticated && cartItemsCount > 0 && (
                        <Badge
                          variant="primary"
                          size="sm"
                          className="absolute -top-2 -left-2 w-5 h-5 p-0"
                        >
                          {cartItemsCount}
                        </Badge>
                      )}
                    </div>
                  }
                  label="السلة"
                  onClick={() => {
                    onCartClick();
                    onClose();
                  }}
                />

                {/* Favorites - Authenticated Only */}
                {isAuthenticated && (
                  <MobileMenuItem
                    icon={<Heart className="w-5 h-5 text-pink-500" />}
                    label="المفضلة"
                    onClick={() => {
                      router.push('/favorites');
                      onClose();
                    }}
                  />
                )}

                {/* Orders - Authenticated Only */}
                {isAuthenticated && (
                  <MobileMenuItem
                    icon={<Package className="w-5 h-5 text-green-500" />}
                    label="طلباتي"
                    onClick={() => {
                      router.push('/orders');
                      onClose();
                    }}
                  />
                )}

                {/* Profile - Authenticated Only */}
                {isAuthenticated && (
                  <MobileMenuItem
                    icon={<User className="w-5 h-5 text-indigo-500" />}
                    label="الملف الشخصي"
                    onClick={() => {
                      onProfileClick();
                      onClose();
                    }}
                  />
                )}

                {/* Theme Toggle */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      الوضع المظلم
                    </span>
                    <ThemeToggle />
                  </div>
                </div>

                {/* Divider for Logout */}
                {isAuthenticated && (
                  <div className="h-px bg-gray-200 dark:bg-slate-700 my-2" />
                )}

                {/* Login / Logout */}
                {isAuthenticated ? (
                  <MobileMenuItem
                    icon={<LogOut className="w-5 h-5" />}
                    label="تسجيل خروج"
                    variant="danger"
                    onClick={onLogout}
                  />
                ) : (
                  <MobileMenuItem
                    icon={<User className="w-5 h-5" />}
                    label="تسجيل الدخول"
                    variant="primary"
                    onClick={() => {
                      router.push('/auth/login');
                      onClose();
                    }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Mobile Menu Item Props
interface MobileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  variant?: 'default' | 'primary' | 'danger';
}

// Mobile Menu Item Component
function MobileMenuItem({
  icon,
  label,
  onClick,
  isActive = false,
  variant = 'default',
}: MobileMenuItemProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'danger':
        return 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400';
      default:
        return `hover:bg-gray-100 dark:hover:bg-slate-800 ${
          isActive ? 'text-blue-500' : 'text-gray-900 dark:text-gray-100'
        }`;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-right ${getVariantClasses()}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

