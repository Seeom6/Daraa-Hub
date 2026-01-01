/**
 * Mobile Navigation Component
 * Bottom navigation bar for mobile devices
 * Shows Home, Offers, Cart, and Profile
 */

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Tag, ShoppingCart, User } from 'lucide-react';
import { Badge } from '@daraa/ui';
import { useAuth } from '@/contexts/AuthContext';

interface MobileNavigationProps {
  cartItemsCount?: number;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}

function NavItem({ icon, label, isActive, onClick, badge }: NavItemProps) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-slate-900 relative"
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <Badge 
            variant="primary" 
            size="sm" 
            className="absolute -top-2 -left-2 w-5 h-5 p-0"
          >
            {badge > 99 ? '99+' : badge}
          </Badge>
        )}
      </div>
      <span className={`text-xs ${isActive ? 'text-blue-500 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
        {label}
      </span>
    </button>
  );
}

export function MobileNavigation({ cartItemsCount = 0 }: MobileNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

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

  const handleOffersClick = () => {
    router.push('/offers');
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-3">
        {/* Home */}
        <NavItem
          icon={
            <Home className={`w-6 h-6 ${pathname === '/' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
          }
          label="الرئيسية"
          isActive={pathname === '/'}
          onClick={handleHomeClick}
        />

        {/* Offers */}
        <NavItem
          icon={
            <Tag className={`w-6 h-6 ${pathname === '/offers' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
          }
          label="العروض"
          isActive={pathname === '/offers'}
          onClick={handleOffersClick}
        />

        {/* Cart */}
        <NavItem
          icon={
            <ShoppingCart className={`w-6 h-6 ${pathname === '/cart' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
          }
          label="السلة"
          isActive={pathname === '/cart'}
          onClick={handleCartClick}
          badge={isAuthenticated ? cartItemsCount : undefined}
        />

        {/* Profile */}
        <NavItem
          icon={
            <User className={`w-6 h-6 ${pathname === '/profile' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
          }
          label={isAuthenticated ? 'حسابي' : 'دخول'}
          isActive={pathname === '/profile'}
          onClick={handleProfileClick}
        />
      </div>
    </nav>
  );
}

