import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  Store,
  ChevronRight,
  Calendar,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  Edit,
  Star,
  TrendingUp,
  Award,
  Gift,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Plus,
  Sparkles,
  Trophy,
  Crown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ProfilePageProps {
  userName: string;
  userEmail: string;
  userPhone: string;
  userAvatar: string;
  currentPoints: number;
  onBack: () => void;
  onBecomeVendor?: () => void;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'delivered' | 'shipping' | 'processing' | 'cancelled';
  total: number;
  items: number;
  image: string;
  storeName: string;
}

const statusConfig = {
  delivered: { label: 'تم التوصيل', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
  shipping: { label: 'قيد التوصيل', icon: Truck, color: 'text-blue-500 bg-blue-500/10' },
  processing: { label: 'قيد المعالجة', icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
  cancelled: { label: 'ملغي', icon: XCircle, color: 'text-rose-500 bg-rose-500/10' },
};

export function ProfilePage({ 
  userName, 
  userEmail, 
  userPhone, 
  userAvatar,
  currentPoints,
  onBack,
  onBecomeVendor
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // حساب المستوى والخصم بناءً على نقاط الولاء (حسب ملف التوثيق)
  const getTierFromPoints = (points: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
    if (points >= 10000) return 'platinum';
    if (points >= 5000) return 'gold';
    if (points >= 1000) return 'silver';
    return 'bronze';
  };

  const getDiscountFromPoints = (points: number): number => {
    if (points >= 10000) return 15;
    if (points >= 5000) return 10;
    if (points >= 1000) return 5;
    return 0;
  };

  const getNextTierInfo = (points: number) => {
    if (points >= 10000) return { tier: 'platinum', pointsNeeded: 0 };
    if (points >= 5000) return { tier: 'platinum', pointsNeeded: 10000 - points };
    if (points >= 1000) return { tier: 'gold', pointsNeeded: 5000 - points };
    return { tier: 'silver', pointsNeeded: 1000 - points };
  };

  const currentTierKey = getTierFromPoints(currentPoints);
  const currentDiscount = getDiscountFromPoints(currentPoints);
  const nextTierInfo = getNextTierInfo(currentPoints);

  // تعريف المستويات حسب ملف التوثيق (02-CUSTOMER-PROFILE.md)
  const tiers = {
    bronze: { 
      name: 'برونزي', 
      icon: Award, 
      color: 'from-amber-700 to-amber-500', 
      min: 0, 
      max: 999,
      discount: '0%',
      benefits: 'المستوى الافتراضي للعملاء الجدد'
    },
    silver: { 
      name: 'فضي', 
      icon: Star, 
      color: 'from-gray-400 to-gray-300', 
      min: 1000, 
      max: 4999,
      discount: '5%',
      benefits: 'خصم 5% على جميع المشتريات'
    },
    gold: { 
      name: 'ذهبي', 
      icon: Trophy, 
      color: 'from-yellow-500 to-yellow-300', 
      min: 5000, 
      max: 9999,
      discount: '10%',
      benefits: 'خصم 10% + شحن مجاني'
    },
    platinum: { 
      name: 'بلاتيني', 
      icon: Crown, 
      color: 'from-purple-500 to-pink-500', 
      min: 10000, 
      max: Infinity,
      discount: '15%',
      benefits: 'خصم 15% + شحن مجاني + دعم VIP'
    }
  };

  // بيانات الطلبات - حسب ملف التوثيق (بالليرة السورية)
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001234',
      date: '2024-11-01',
      status: 'delivered',
      total: 125500,  // ليرة سورية
      items: 3,
      image: 'https://images.unsplash.com/photo-1656360088907-5109c245851d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMHByb2R1Y3RzfGVufDF8fHx8MTc2MjA4ODQ4NHww&ixlib=rb-4.1.0&q=80&w=1080',
      storeName: 'متجر الإلكترونيات'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-001235',
      date: '2024-10-28',
      status: 'shipping',
      total: 89000,  // ليرة سورية
      items: 2,
      image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpdmVyeSUyMHBhY2thZ2V8ZW58MXx8fHwxNzYyMDkwMzk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      storeName: 'متجر الأزياء'
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-001220',
      date: '2024-10-25',
      status: 'processing',
      total: 245000,  // ليرة سورية
      items: 5,
      image: 'https://images.unsplash.com/photo-1656360088907-5109c245851d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMHByb2R1Y3RzfGVufDF8fHx8MTc2MjA4ODQ4NHww&ixlib=rb-4.1.0&q=80&w=1080',
      storeName: 'متجر الهدايا'
    },
  ];

  // Stats data - البيانات الإحصائية حسب ملف العميل
  const stats = [
    { label: 'إجمالي الطلبات', value: orders.length.toString(), icon: Package, color: 'from-blue-500 to-blue-600' },
    { label: 'النقاط المتاحة', value: currentPoints.toLocaleString('ar-SY'), icon: Star, color: 'from-amber-500 to-orange-600' },
    { label: 'قائمة الأمنيات', value: '8', icon: Heart, color: 'from-rose-500 to-pink-600' },
    { label: `الخصم الحالي ${currentDiscount}%`, value: tiers[currentTierKey].name, icon: Gift, color: 'from-emerald-500 to-teal-600' },
  ];

  const currentTier = tiers[currentTierKey];
  const TierIcon = currentTier.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 pt-16 pb-24 sm:pb-32">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="mb-6 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للمتجر
          </Button>

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-white/30 rounded-full blur-lg" />
              <Avatar className="relative w-24 h-24 sm:w-32 sm:h-32 border-4 border-white/50 shadow-2xl">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="text-2xl sm:text-3xl">{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-white text-blue-600 hover:bg-white shadow-lg"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </motion.div>

            <div className="flex-1 text-center sm:text-right">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white text-2xl sm:text-3xl lg:text-4xl mb-2"
              >
                {userName}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white/90 text-sm sm:text-base mb-1"
              >
                {userEmail}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white/80 text-sm"
              >
                {userPhone}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start"
              >
                <Badge className={`bg-gradient-to-r ${currentTier.color} text-white border-white/30 backdrop-blur-sm shadow-lg`}>
                  <TierIcon className="w-4 h-4 ml-1" />
                  {currentTier.name}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Gift className="w-3 h-3 ml-1" />
                  خصم {currentDiscount}%
                </Badge>
                {currentTier.benefits.includes('شحن مجاني') && (
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    <Truck className="w-3 h-3 ml-1" />
                    شحن مجاني
                  </Badge>
                )}
              </motion.div>
            </div>

            {/* Create Store Button - Highlighted */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-white/90 shadow-2xl gap-2 relative overflow-hidden group"
                onClick={onBecomeVendor}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Store className="w-5 h-5" />
                <span className="relative">إضافة متجري</span>
                <Sparkles className="w-4 h-4 relative" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl mb-1">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex h-auto p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 shadow-lg">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">طلباتي</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Tier Benefits - المزايا حسب المستوى */}
            <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-800/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TierIcon className="w-5 h-5 text-purple-500" />
                  مزايا مستوى {currentTier.name}
                </CardTitle>
                <CardDescription>{currentTier.benefits}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.values(tiers).map((tier) => {
                    const Icon = tier.icon;
                    const isCurrentTier = tier.name === currentTier.name;
                    const isLocked = currentPoints < tier.min;
                    
                    return (
                      <div
                        key={tier.name}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isCurrentTier
                            ? `bg-gradient-to-br ${tier.color} border-white/50 text-white shadow-lg`
                            : isLocked
                            ? 'bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-700 opacity-50'
                            : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 hover:border-purple-500'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center gap-2">
                          <Icon className={`w-8 h-8 ${isCurrentTier ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                          <div>
                            <p className={`text-sm mb-1 ${isCurrentTier ? 'text-white' : ''}`}>{tier.name}</p>
                            <p className={`text-xs ${isCurrentTier ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                              {tier.min.toLocaleString('ar-SY')}+ نقطة
                            </p>
                            <p className={`text-sm mt-1 ${isCurrentTier ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`}>
                              {tier.discount}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-800/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    آخر الطلبات
                  </CardTitle>
                  <CardDescription>آخر 3 طلبات قمت بها</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orders.slice(0, 3).map((order) => {
                    const StatusIcon = statusConfig[order.status].icon;
                    return (
                      <div
                        key={order.id}
                        className="flex gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-slate-800">
                          <ImageWithFallback
                            src={order.image}
                            alt={order.orderNumber}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm truncate">{order.orderNumber}</p>
                            <Badge className={statusConfig[order.status].color}>
                              <StatusIcon className="w-3 h-3 ml-1" />
                              {statusConfig[order.status].label}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{order.storeName}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{order.items} منتج</span>
                            <span className="text-blue-600 dark:text-blue-400">{order.total.toLocaleString('ar-SY')} ل.س</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('orders')}>
                    عرض جميع الطلبات
                    <ChevronRight className="w-4 h-4 mr-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-800/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    إجراءات سريعة
                  </CardTitle>
                  <CardDescription>الوصول السريع للميزات الهامة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* نقاط الولاء - حسب ملف التوثيق */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm">نقاط الولاء</p>
                          <p className="text-2xl text-amber-600 dark:text-amber-400">{currentPoints.toLocaleString('ar-SY')}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-500 dark:text-gray-400">القيمة النقدية</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">{(currentPoints / 100).toLocaleString('ar-SY')} ل.س</p>
                      </div>
                    </div>
                    {nextTierInfo.pointsNeeded > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>التقدم للمستوى التالي</span>
                          <span>{nextTierInfo.pointsNeeded.toLocaleString('ar-SY')} نقطة متبقية</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-1000"
                            style={{ 
                              width: `${((currentPoints - currentTier.min) / (currentTier.max - currentTier.min)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 hover:bg-pink-50 dark:hover:bg-slate-800 hover:border-pink-500">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right flex-1">
                      <p className="text-sm">قائمة الأمنيات</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">8 منتج</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 hover:bg-purple-50 dark:hover:bg-slate-800 hover:border-purple-500">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right flex-1">
                      <p className="text-sm">عناوين التوصيل</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">3 عناوين</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:border-emerald-500">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right flex-1">
                      <p className="text-sm">طرق الدفع</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2 بطاقة محفوظة</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Button>

                  {/* كيف تكسب النقاط - حسب ملف التوثيق */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm">كيف تكسب النقاط؟</p>
                    </div>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>• كل 1 ليرة سورية</span>
                        <span className="text-amber-600 dark:text-amber-400">= 1 نقطة</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• كتابة تقييم</span>
                        <span className="text-amber-600 dark:text-amber-400">= 50 نقطة</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• دعوة صديق</span>
                        <span className="text-amber-600 dark:text-amber-400">= 100 نقطة</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-800/50 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>جميع الطلبات</CardTitle>
                    <CardDescription>تاريخ طلباتك الكامل</CardDescription>
                  </div>
                  <Badge className="bg-blue-500 text-white">
                    {orders.length} طلب
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {orders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group hover:shadow-lg"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-slate-800">
                          <ImageWithFallback
                            src={order.image}
                            alt={order.orderNumber}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="mb-1">{order.orderNumber}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{order.storeName}</p>
                            </div>
                            <Badge className={statusConfig[order.status].color}>
                              <StatusIcon className="w-3 h-3 ml-1" />
                              {statusConfig[order.status].label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {order.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {order.items} منتج
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg text-blue-600 dark:text-blue-400">{order.total.toLocaleString('ar-SY')} ل.س</span>
                            <Button variant="outline" size="sm">
                              التفاصيل
                              <ChevronRight className="w-4 h-4 mr-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* نظام النقاط والمستويات - شرح تفصيلي */}
            <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-800/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  نظام المستويات ونقاط الولاء
                </CardTitle>
                <CardDescription>معلومات تفصيلية عن كيفية كسب واستخدام النقاط</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* كيف تكسب النقاط */}
                <div>
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-emerald-500" />
                    كيف تكسب النقاط؟
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <span>• كل 1 ليرة سورية تنفقها</span>
                      <span className="text-amber-600 dark:text-amber-400">= 1 نقطة</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <span>• كتابة تقييم للمنتج</span>
                      <span className="text-amber-600 dark:text-amber-400">= 50 نقطة</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <span>• دعوة صديق للتسجيل</span>
                      <span className="text-amber-600 dark:text-amber-400">= 100 نقطة</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* كيف تستخدم النقاط */}
                <div>
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-500" />
                    كيف تستخدم النقاط؟
                  </h4>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-300">
                      <strong>100 نقطة = 1 ليرة سورية خصم</strong>
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      يمكنك استخدام نقاطك عند الدفع للحصول على خصم فوري
                    </p>
                  </div>
                </div>

                <Separator />

                {/* المستويات والمزايا */}
                <div>
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-purple-500" />
                    المستويات والمزايا
                  </h4>
                  <div className="space-y-2 text-xs">
                    {Object.values(tiers).map((tier) => {
                      const Icon = tier.icon;
                      return (
                        <div key={tier.name} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{tier.name}</span>
                            <span className="text-purple-600 dark:text-purple-400 mr-auto">{tier.discount}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            {tier.min.toLocaleString('ar-SY')} - {tier.max === Infinity ? '∞' : tier.max.toLocaleString('ar-SY')} نقطة
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{tier.benefits}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Account Settings */}
              <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-800/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    إعدادات الحساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm">الإشعارات</p>
                        <p className="text-xs text-gray-500">تلقي تحديثات الطلبات</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm">المصادقة الثنائية</p>
                        <p className="text-xs text-gray-500">حماية إضافية للحساب</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm">حفظ معلومات الدفع</p>
                        <p className="text-xs text-gray-500">للدفع السريع</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Privacy & Security */}
              <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-800/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    الخصوصية والأمان
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Edit className="w-4 h-4 text-gray-500" />
                    تغيير كلمة المرور
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    إدارة العناوين
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-3">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    طرق الدفع
                  </Button>

                  <Separator className="my-4" />

                  <Button variant="outline" className="w-full justify-start gap-3 text-rose-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20">
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}