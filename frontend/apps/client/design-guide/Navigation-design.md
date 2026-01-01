<!-- mobile veiw -->
import { Home, Tag, ShoppingCart, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';

interface MobileNavigationProps {
  cartItemsCount?: number;
}

export function MobileNavigation({ 
  cartItemsCount = 3,
}: MobileNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    } else {
      // TODO: Navigate to cart page
      console.log('Navigate to cart');
    }
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 shadow-2xl">
      <div className="flex items-center justify-around px-2 py-3 safe-bottom">
        {/* Home */}
        <Link to="/" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-slate-900">
          <Home className={`w-6 h-6 ${location.pathname === '/' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
          <span className={`text-xs ${location.pathname === '/' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>الرئيسية</span>
        </Link>

        {/* Offers */}
        <button 
          onClick={() => console.log('Navigate to offers')}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-slate-900"
        >
          <Tag className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400">العروض</span>
        </button>

        {/* Cart */}
        <button 
          onClick={handleCartClick}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-slate-900 relative"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            {isAuthenticated && cartItemsCount > 0 && (
              <Badge className="absolute -top-2 -left-2 w-5 h-5 flex items-center justify-center p-0 bg-blue-500 text-white text-xs">
                {cartItemsCount}
              </Badge>
            )}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">السلة</span>
        </button>

        {/* Profile */}
        <button 
          onClick={handleProfileClick}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-slate-900"
        >
          <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {isAuthenticated ? 'حسابي' : 'دخول'}
          </span>
        </button>
      </div>
    </nav>
  );
}


import { Search, ShoppingCart, User, Moon, Sun, Menu, X, Home, Heart, Package, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from 'figma:asset/c91d9d50cd22d9520a7b161f57bc4ae08e0fc02e.png';

interface NavbarProps {
  cartItemsCount?: number;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function Navbar({ 
  cartItemsCount = 3, 
  isDarkMode = false, 
  onToggleTheme,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    } else {
      // TODO: Navigate to cart page
      console.log('Navigate to cart');
    }
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/auth/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-gray-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img 
                src={logoImage} 
                alt="Sillap" 
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="ابحث عن المنتجات..."
                className="w-full h-11 pr-11 bg-gray-100 dark:bg-slate-900 border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Button */}
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="ghost"
              size="icon"
              className="sm:hidden w-10 h-10 rounded-full"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              )}
            </Button>

            {/* Theme Toggle - Desktop Only */}
            {onToggleTheme && (
              <Button
                onClick={onToggleTheme}
                variant="ghost"
                size="icon"
                className="hidden sm:flex w-10 h-10 rounded-full"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                )}
              </Button>
            )}

            {/* Cart - Desktop Only */}
            <Button
              onClick={handleCartClick}
              variant="ghost"
              size="icon"
              className="hidden sm:flex relative w-10 h-10 rounded-full"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              {isAuthenticated && cartItemsCount > 0 && (
                <Badge className="absolute -top-1 -left-1 w-5 h-5 flex items-center justify-center p-0 bg-blue-500 text-white text-xs">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>

            {/* Profile / Login - Desktop Only */}
            {isAuthenticated ? (
              <Button
                onClick={handleProfileClick}
                variant="ghost"
                size="icon"
                className="hidden sm:flex w-10 h-10 rounded-full"
              >
                <User className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </Button>
            ) : (
              <Link to="/auth/login">
                <Button
                  variant="ghost"
                  className="hidden sm:flex h-10 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
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
                    <Input
                      type="search"
                      placeholder="ابحث عن المنتجات..."
                      className="w-full h-11 pr-11 bg-gray-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">
                  {/* Home */}
                  <button
                    onClick={() => {
                      navigate('/');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-right text-gray-900 dark:text-gray-100"
                  >
                    <Home className="w-5 h-5 text-blue-500" />
                    <span>الرئيسية</span>
                  </button>

                  {/* Cart */}
                  <button
                    onClick={() => {
                      handleCartClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-right text-gray-900 dark:text-gray-100"
                  >
                    <div className="relative">
                      <ShoppingCart className="w-5 h-5 text-purple-500" />
                      {isAuthenticated && cartItemsCount > 0 && (
                        <Badge className="absolute -top-2 -left-2 w-5 h-5 flex items-center justify-center p-0 bg-blue-500 text-white text-xs">
                          {cartItemsCount}
                        </Badge>
                      )}
                    </div>
                    <span>السلة</span>
                  </button>

                  {/* Favorites */}
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        // TODO: Navigate to favorites
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-right text-gray-900 dark:text-gray-100"
                    >
                      <Heart className="w-5 h-5 text-pink-500" />
                      <span>المفضلة</span>
                    </button>
                  )}

                  {/* Orders */}
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        // TODO: Navigate to orders
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-right text-gray-900 dark:text-gray-100"
                    >
                      <Package className="w-5 h-5 text-green-500" />
                      <span>طلباتي</span>
                    </button>
                  )}

                  {/* Profile */}
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        handleProfileClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-right text-gray-900 dark:text-gray-100"
                    >
                      <User className="w-5 h-5 text-indigo-500" />
                      <span>الملف الشخصي</span>
                    </button>
                  )}

                  {/* Theme Toggle */}
                  {onToggleTheme && (
                    <button
                      onClick={() => {
                        onToggleTheme();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-right text-gray-900 dark:text-gray-100"
                    >
                      {isDarkMode ? (
                        <>
                          <Sun className="w-5 h-5 text-amber-500" />
                          <span>الوضع الفاتح</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                          <span>الوضع المظلم</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Divider */}
                  {isAuthenticated && (
                    <div className="h-px bg-gray-200 dark:bg-slate-700 my-2" />
                  )}

                  {/* Login / Logout */}
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-right text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>تسجيل خروج</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        navigate('/auth/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors text-right text-white"
                    >
                      <User className="w-5 h-5" />
                      <span>تسجيل الدخول</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
