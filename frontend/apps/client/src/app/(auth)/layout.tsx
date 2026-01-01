/**
 * Auth Layout
 *
 * Simple layout for authentication pages
 * Background is handled by each page component
 */

import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <>{children}</>;
}

