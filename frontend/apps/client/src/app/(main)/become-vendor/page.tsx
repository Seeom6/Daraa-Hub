/**
 * Become Vendor Page
 * Page for customers to apply to become store owners
 */

import { BecomeVendorPage } from '@/features/vendor/presentation/pages';

export const metadata = {
  title: 'أصبح بائعاً - Daraa',
  description: 'انضم إلى منصة Daraa كبائع وابدأ في بيع منتجاتك',
};

export default function BecomeVendorRoute() {
  return <BecomeVendorPage />;
}

