/**
 * Footer Component
 * Main footer with links and information
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { MainContainer } from '../containers';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-auto ${className}`}>
      <MainContainer>
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <Image
              src="/logo.svg"
              alt="Sillap Logo"
              width={100}
              height={40}
              className="h-10 w-auto"
            />
            <h3 className="text-gray-900 dark:text-gray-100">منصة Sillap</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              أفضل تجربة تسوق عبر الإنترنت في سوريا. نوفر لك منتجات عالية الجودة بأسعار منافسة.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a href="#" className="btn-icon">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="btn-icon">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="btn-icon">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-gray-900 dark:text-gray-100">روابط سريعة</h4>
            <ul className="space-y-2">
              <FooterLink href="/">الرئيسية</FooterLink>
              <FooterLink href="/products">المنتجات</FooterLink>
              <FooterLink href="/categories">التصنيفات</FooterLink>
              <FooterLink href="/about">من نحن</FooterLink>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-gray-900 dark:text-gray-100">خدمة العملاء</h4>
            <ul className="space-y-2">
              <FooterLink href="/help">المساعدة</FooterLink>
              <FooterLink href="/shipping">الشحن والتوصيل</FooterLink>
              <FooterLink href="/returns">الإرجاع والاستبدال</FooterLink>
              <FooterLink href="/privacy">سياسة الخصوصية</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-gray-900 dark:text-gray-100">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+963 123 456 789</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>info@sillap.sy</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>دمشق، سوريا</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center md:text-start">
              © {currentYear} منصة Sillap. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-6">
              <Link 
                href="/terms" 
                className="text-gray-600 dark:text-gray-400 hover:text-blue-500 text-sm transition-colors"
              >
                الشروط والأحكام
              </Link>
              <Link 
                href="/privacy" 
                className="text-gray-600 dark:text-gray-400 hover:text-blue-500 text-sm transition-colors"
              >
                سياسة الخصوصية
              </Link>
            </div>
          </div>
        </div>
      </MainContainer>
    </footer>
  );
}

// Footer Link Component
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link 
        href={href}
        className="text-gray-600 dark:text-gray-400 hover:text-blue-500 text-sm transition-colors inline-block"
      >
        {children}
      </Link>
    </li>
  );
}

