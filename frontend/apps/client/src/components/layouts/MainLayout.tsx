/**
 * Main Layout Component
 * Layout for main application pages (with Navbar, Footer, and Mobile Navigation)
 */

'use client';

import { ReactNode } from 'react';
import { Navbar } from '../navigation/Navbar';
import { MobileNavigation } from '../navigation/MobileNavigation';
import { Footer } from '../navigation/Footer';

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  showMobileNav?: boolean;
  cartItemsCount?: number;
}

export function MainLayout({
  children,
  showFooter = true,
  showMobileNav = true,
  cartItemsCount = 0,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">
      {/* Top Navigation */}
      <Navbar cartItemsCount={cartItemsCount} />

      {/* Main Content - Add bottom padding for mobile nav */}
      <main className={`flex-1 ${showMobileNav ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </main>

      {/* Footer - Hidden on mobile when MobileNav is shown */}
      {showFooter && <Footer className={showMobileNav ? 'hidden md:block' : ''} />}

      {/* Mobile Bottom Navigation */}
      {showMobileNav && <MobileNavigation cartItemsCount={cartItemsCount} />}
    </div>
  );
}

