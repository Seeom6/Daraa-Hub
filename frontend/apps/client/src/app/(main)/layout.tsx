/**
 * Main Layout
 * Layout for main pages (home, categories, products, etc.)
 * Includes Navbar and Footer
 */

import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { MainContainer } from '@/components/containers';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* Navbar */}
      <Navbar cartItemsCount={0} />

      {/* Main Content */}
      <main className="flex-1">
        <MainContainer className="py-6">
          {children}
        </MainContainer>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

