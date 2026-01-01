# 📐 دليل Layout - منصة Sillap

## 📋 نظرة عامة
هذا الدليل يغطي جميع أنماط الـ Layout المستخدمة في منصة Sillap، مع التركيز على التصميم المتجاوب (Responsive)، دعم الـ RTL، والتناسق عبر جميع الصفحات.

---

## 🏗️ هيكل Layout الأساسي

### البنية الرئيسية
```tsx
<html lang="ar" dir="rtl">
  <body>
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main>
        {/* Page Content */}
      </main>
      
      {/* Footer (optional) */}
      <Footer />
    </div>
  </body>
</html>
```

### القاعدة الأساسية لكل صفحة
```tsx
function PageComponent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* المحتوى */}
    </div>
  );
}
```

---

## 📦 Container Patterns

### 1. Main Container (الحاوية الرئيسية)
**الاستخدام:** جميع الصفحات الرئيسية

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* المحتوى */}
</div>
```

**المواصفات:**
- `max-w-7xl` = 1280px maximum width
- `mx-auto` = center horizontally
- `px-4` = 16px padding على الموبايل
- `sm:px-6` = 24px padding على التابلت
- `lg:px-8` = 32px padding على الديسكتوب

---

### 2. Wide Container (حاوية عريضة)
**الاستخدام:** الصفحات التي تحتاج مساحة أكبر (Dashboards)

```tsx
<div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
  {/* المحتوى */}
</div>
```

---

### 3. Narrow Container (حاوية ضيقة)
**الاستخدام:** صفحات المصادقة، النماذج

```tsx
<div className="max-w-md mx-auto px-4">
  {/* المحتوى - مثل Login Form */}
</div>
```

**الأحجام المتاحة:**
- `max-w-sm` = 384px (24rem)
- `max-w-md` = 448px (28rem)
- `max-w-lg` = 512px (32rem)
- `max-w-xl` = 576px (36rem)

---

### 4. Content Container (حاوية المحتوى)
**الاستخدام:** المقالات، المحتوى النصي

```tsx
<div className="max-w-3xl mx-auto px-4 sm:px-6">
  <article className="prose dark:prose-invert">
    {/* المحتوى */}
  </article>
</div>
```

---

## 🎯 Section Layout (تخطيط الأقسام)

### 1. Hero Section
**الاستخدام:** القسم الأول في الصفحة الرئيسية

```tsx
<section className="relative min-h-[600px] flex items-center">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* النص */}
      <div className="space-y-6">
        <h1>العنوان الرئيسي</h1>
        <p>الوصف</p>
        <div className="flex gap-4">
          <Button>ابدأ الآن</Button>
        </div>
      </div>
      
      {/* الصورة */}
      <div className="relative">
        <img src={heroImage} alt="Hero" />
      </div>
    </div>
  </div>
</section>
```

---

### 2. Content Section
**الاستخدام:** الأقسام العادية في الصفحة

```tsx
<section className="py-16 md:py-24">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* العنوان */}
    <div className="text-center mb-12">
      <h2 className="mb-4">عنوان القسم</h2>
      <p className="text-gray-600 dark:text-gray-400">
        وصف القسم
      </p>
    </div>
    
    {/* المحتوى */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* البطاقات */}
    </div>
  </div>
</section>
```

**المسافات الرأسية (Vertical Spacing):**
- `py-8` = 32px (Sections صغيرة)
- `py-12` = 48px (Sections متوسطة)
- `py-16` = 64px (Sections كبيرة)
- `py-24` = 96px (Sections رئيسية)

---

### 3. Feature Section (قسم المميزات)
```tsx
<section className="py-16 bg-white dark:bg-slate-900">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature) => (
        <div key={feature.id} className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
            <Icon className="w-8 h-8 text-blue-500" />
          </div>
          <h3>{feature.title}</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>
```

---

## 🎨 Grid Layouts

### 1. Product Grid (شبكة المنتجات)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

**النمط:**
- موبايل: عمود واحد
- تابلت صغير (640px+): عمودين
- ديسكتوب (1024px+): 3 أعمدة
- شاشة كبيرة (1280px+): 4 أعمدة

---

### 2. Category Grid (شبكة التصنيفات)
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {categories.map((category) => (
    <CategoryCard key={category.id} category={category} />
  ))}
</div>
```

**النمط:**
- موبايل: عمودين
- تابلت (768px+): 3 أعمدة
- ديسكتوب (1024px+): 4 أعمدة

---

### 3. Feature Grid (شبكة المميزات)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {features.map((feature) => (
    <FeatureCard key={feature.id} feature={feature} />
  ))}
</div>
```

---

### 4. Dashboard Grid (شبكة لوحة التحكم)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Main Content - 2 columns */}
  <div className="lg:col-span-2 space-y-6">
    <StatsCards />
    <ChartsSection />
  </div>
  
  {/* Sidebar - 1 column */}
  <div className="space-y-6">
    <ActivityFeed />
    <QuickActions />
  </div>
</div>
```

---

## 📊 Dashboard Layouts

### 1. Admin Dashboard Layout
```tsx
<div className="min-h-screen bg-gray-50 dark:bg-slate-950">
  {/* Header */}
  <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <h1>لوحة التحكم</h1>
        <div className="flex items-center gap-3">
          {/* Actions */}
        </div>
      </div>
    </div>
  </header>
  
  {/* Main Content */}
  <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Dashboard Content */}
  </main>
</div>
```

---

### 2. Stats Cards Row
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard 
    title="إجمالي المبيعات"
    value="125,000 ريال"
    icon={<DollarSign />}
    trend="+12%"
  />
  <StatCard 
    title="الطلبات"
    value="1,234"
    icon={<ShoppingBag />}
    trend="+5%"
  />
  <StatCard 
    title="العملاء"
    value="456"
    icon={<Users />}
    trend="+8%"
  />
  <StatCard 
    title="المنتجات"
    value="89"
    icon={<Package />}
    trend="+3%"
  />
</div>
```

---

### 3. Two Column Dashboard
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Left Column */}
  <div className="space-y-6">
    <SalesChart />
    <RecentOrders />
  </div>
  
  {/* Right Column */}
  <div className="space-y-6">
    <TopProducts />
    <CustomerStats />
  </div>
</div>
```

---

## 📱 Navigation Layouts

### 1. Main Navbar (Desktop)
```tsx
<nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-gray-200/50 dark:border-slate-800/50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16 sm:h-20">
      {/* Logo */}
      <Link to="/" className="flex-shrink-0">
        <img src={logo} alt="Logo" className="h-12 sm:h-14" />
      </Link>
      
      {/* Center Content (optional) */}
      <div className="hidden md:flex flex-1 max-w-xl mx-8">
        <SearchBar />
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        <IconButton icon={<ShoppingCart />} />
        <IconButton icon={<User />} />
      </div>
    </div>
  </div>
</nav>
```

---

### 2. Mobile Menu Layout
```tsx
{/* Overlay */}
<div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />

{/* Menu Panel */}
<div className="fixed top-20 left-4 right-4 z-50">
  <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
    {/* Search */}
    <div className="p-4 border-b border-gray-200 dark:border-slate-700">
      <SearchBar />
    </div>
    
    {/* Menu Items */}
    <div className="p-2 space-y-1">
      <MenuItem icon={<Home />} label="الرئيسية" />
      <MenuItem icon={<ShoppingCart />} label="السلة" />
      <MenuItem icon={<User />} label="الملف الشخصي" />
    </div>
  </div>
</div>
```

---

### 3. Sidebar Navigation (Dashboard)
```tsx
<div className="flex min-h-screen">
  {/* Sidebar */}
  <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 flex-col">
    {/* Logo */}
    <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-800">
      <img src={logo} alt="Logo" className="h-10" />
    </div>
    
    {/* Navigation */}
    <nav className="flex-1 p-4 space-y-2">
      <NavLink icon={<LayoutDashboard />} label="لوحة التحكم" to="/dashboard" />
      <NavLink icon={<Package />} label="المنتجات" to="/products" />
      <NavLink icon={<Users />} label="العملاء" to="/customers" />
    </nav>
  </aside>
  
  {/* Main Content */}
  <main className="flex-1 overflow-auto">
    {/* Page Content */}
  </main>
</div>
```

---

## 🎴 Card Layouts

### 1. Product Card
```tsx
<div className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
  {/* Image */}
  <div className="aspect-square overflow-hidden">
    <img 
      src={product.image}
      alt={product.name}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
    />
  </div>
  
  {/* Content */}
  <div className="p-4 space-y-3">
    <h3 className="text-gray-900 dark:text-gray-100">
      {product.name}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm">
      {product.description}
    </p>
    
    {/* Footer */}
    <div className="flex items-center justify-between pt-2">
      <span className="text-blue-500">
        {product.price} ريال
      </span>
      <Button size="sm">
        إضافة
      </Button>
    </div>
  </div>
</div>
```

---

### 2. Stat Card
```tsx
<div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 p-6">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
      <Icon className="w-6 h-6 text-blue-500" />
    </div>
    <span className="text-green-500 text-sm">+12%</span>
  </div>
  
  {/* Content */}
  <div className="space-y-1">
    <p className="text-gray-600 dark:text-gray-400 text-sm">
      العنوان
    </p>
    <h3 className="text-gray-900 dark:text-gray-100">
      1,234
    </h3>
  </div>
</div>
```

---

### 3. Profile Card
```tsx
<div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
  {/* Cover Image */}
  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500" />
  
  {/* Profile Content */}
  <div className="p-6 -mt-16">
    {/* Avatar */}
    <div className="relative inline-block">
      <img 
        src={user.avatar}
        alt={user.name}
        className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900"
      />
      <div className="absolute bottom-0 left-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
    </div>
    
    {/* Info */}
    <div className="mt-4 space-y-2">
      <h2 className="text-gray-900 dark:text-gray-100">
        {user.name}
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        {user.email}
      </p>
    </div>
    
    {/* Stats */}
    <div className="mt-6 grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="text-gray-900 dark:text-gray-100">123</div>
        <div className="text-gray-600 dark:text-gray-400 text-sm">الطلبات</div>
      </div>
      {/* More stats */}
    </div>
  </div>
</div>
```

---

## 📝 Form Layouts

### 1. Single Column Form
```tsx
<form className="max-w-md mx-auto space-y-6">
  <div className="space-y-2">
    <label className="text-gray-700 dark:text-gray-300">
      البريد الإلكتروني
    </label>
    <Input type="email" placeholder="example@email.com" />
  </div>
  
  <div className="space-y-2">
    <label className="text-gray-700 dark:text-gray-300">
      كلمة المرور
    </label>
    <Input type="password" placeholder="••••••••" />
  </div>
  
  <Button type="submit" className="w-full">
    تسجيل الدخول
  </Button>
</form>
```

---

### 2. Two Column Form
```tsx
<form className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* First Name */}
    <div className="space-y-2">
      <label>الاسم الأول</label>
      <Input type="text" />
    </div>
    
    {/* Last Name */}
    <div className="space-y-2">
      <label>الاسم الأخير</label>
      <Input type="text" />
    </div>
  </div>
  
  {/* Full Width Field */}
  <div className="space-y-2">
    <label>البريد الإلكتروني</label>
    <Input type="email" />
  </div>
  
  {/* Submit */}
  <div className="flex justify-end gap-3">
    <Button variant="ghost">إلغاء</Button>
    <Button type="submit">حفظ</Button>
  </div>
</form>
```

---

### 3. Multi-Step Form Layout
```tsx
<div className="max-w-2xl mx-auto">
  {/* Progress Steps */}
  <div className="mb-8">
    <div className="flex items-center justify-between">
      <Step number={1} label="المعلومات الأساسية" active />
      <div className="flex-1 h-1 bg-gray-200 dark:bg-slate-700 mx-2" />
      <Step number={2} label="العنوان" />
      <div className="flex-1 h-1 bg-gray-200 dark:bg-slate-700 mx-2" />
      <Step number={3} label="التأكيد" />
    </div>
  </div>
  
  {/* Form Content */}
  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-8">
    {/* Current Step Content */}
  </div>
  
  {/* Navigation */}
  <div className="mt-6 flex justify-between">
    <Button variant="ghost">رجوع</Button>
    <Button>التالي</Button>
  </div>
</div>
```

---

## 🎯 Authentication Layouts

### 1. Center Auth Layout
```tsx
<div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
  <div className="w-full max-w-md">
    {/* Logo */}
    <div className="text-center mb-8">
      <img src={logo} alt="Logo" className="h-16 mx-auto mb-4" />
      <h1 className="text-gray-900 dark:text-gray-100 mb-2">
        مرحباً بك
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        سجل دخولك للمتابعة
      </p>
    </div>
    
    {/* Form Card */}
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 p-8">
      <LoginForm />
    </div>
    
    {/* Footer */}
    <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
      ليس لديك حساب؟{' '}
      <Link to="/auth/register" className="text-blue-500 hover:underline">
        سجل الآن
      </Link>
    </p>
  </div>
</div>
```

---

### 2. Split Auth Layout
```tsx
<div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
  {/* Left Side - Form */}
  <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-950">
    <div className="w-full max-w-md">
      <img src={logo} alt="Logo" className="h-12 mb-8" />
      <h1 className="mb-2">تسجيل الدخول</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        أدخل بياناتك للمتابعة
      </p>
      <LoginForm />
    </div>
  </div>
  
  {/* Right Side - Image/Branding */}
  <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-8">
    <div className="text-white text-center">
      <h2 className="mb-4">منصة التجارة الإلكترونية</h2>
      <p className="text-white/80">
        أفضل تجربة تسوق عبر الإنترنت
      </p>
    </div>
  </div>
</div>
```

---

## 📱 Responsive Patterns

### 1. Stack on Mobile, Grid on Desktop
```tsx
<div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
  <Card />
  <Card />
</div>
```

---

### 2. Hide on Mobile, Show on Desktop
```tsx
{/* Show only on desktop */}
<div className="hidden md:block">
  <DesktopContent />
</div>

{/* Show only on mobile */}
<div className="md:hidden">
  <MobileContent />
</div>
```

---

### 3. Responsive Image
```tsx
<div className="aspect-square md:aspect-video overflow-hidden rounded-2xl">
  <img 
    src={image}
    alt="Product"
    className="w-full h-full object-cover"
  />
</div>
```

---

### 4. Responsive Text Alignment
```tsx
<div className="text-center md:text-start">
  <h2>عنوان</h2>
  <p>محتوى</p>
</div>
```

---

## 🌍 RTL Layout Considerations

### 1. استخدام Logical Properties
```tsx
// ❌ تجنب
className="text-left"
className="pl-4"
className="mr-2"

// ✅ استخدم
className="text-start"  // يصبح text-right في RTL
className="ps-4"        // padding-start
className="me-2"        // margin-end
```

---

### 2. Flexbox في RTL
```tsx
// الترتيب يعكس تلقائياً في RTL
<div className="flex items-center gap-3">
  <Icon /> {/* يكون على اليمين في RTL */}
  <span>النص</span>
</div>
```

---

### 3. Grid في RTL
```tsx
// Grid يعكس تلقائياً في RTL
<div className="grid grid-cols-3 gap-4">
  <div>1</div> {/* يبدأ من اليمين في RTL */}
  <div>2</div>
  <div>3</div>
</div>
```

---

### 4. الأيقونات والنصوص
```tsx
// الأيقونة على اليمين للـ RTL
<button className="flex items-center gap-2">
  <span>النص</span>
  <ChevronLeft className="w-5 h-5" /> {/* يجب أن تكون ChevronRight في RTL */}
</button>

// أو استخدم rotate
<ChevronLeft className="w-5 h-5 rtl:rotate-180" />
```

---

## 🎨 Special Layouts

### 1. Masonry Grid (شبكة Pinterest)
```tsx
import Masonry from 'react-responsive-masonry';

<Masonry columnsCount={3} gutter="24px">
  {items.map((item) => (
    <Card key={item.id} item={item} />
  ))}
</Masonry>
```

---

### 2. Carousel Layout
```tsx
import Slider from 'react-slick';

<Slider
  dots={true}
  infinite={true}
  speed={500}
  slidesToShow={3}
  slidesToScroll={1}
  responsive={[
    {
      breakpoint: 1024,
      settings: { slidesToShow: 2 }
    },
    {
      breakpoint: 640,
      settings: { slidesToShow: 1 }
    }
  ]}
>
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</Slider>
```

---

### 3. Modal Layout
```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <h2>عنوان Modal</h2>
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
            <Button variant="ghost" onClick={onClose}>إلغاء</Button>
            <Button onClick={onConfirm}>تأكيد</Button>
          </div>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

---

### 4. Tabs Layout
```tsx
<div>
  {/* Tab Headers */}
  <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
    <button
      className={`px-4 py-3 border-b-2 transition-colors ${
        activeTab === 'tab1'
          ? 'border-blue-500 text-blue-500'
          : 'border-transparent text-gray-600 dark:text-gray-400'
      }`}
      onClick={() => setActiveTab('tab1')}
    >
      التبويب الأول
    </button>
    <button
      className={`px-4 py-3 border-b-2 transition-colors ${
        activeTab === 'tab2'
          ? 'border-blue-500 text-blue-500'
          : 'border-transparent text-gray-600 dark:text-gray-400'
      }`}
      onClick={() => setActiveTab('tab2')}
    >
      التبويب الثاني
    </button>
  </div>
  
  {/* Tab Content */}
  <div className="py-6">
    {activeTab === 'tab1' && <TabOneContent />}
    {activeTab === 'tab2' && <TabTwoContent />}
  </div>
</div>
```

---

## 📐 Spacing Guidelines

### بين الأقسام (Section Spacing)
```css
/* موبايل: 64px (py-16) */
/* ديسكتوب: 96px (md:py-24) */
section { @apply py-16 md:py-24; }
```

### داخل البطاقات (Card Padding)
```css
/* بطاقة صغيرة */
.card-sm { @apply p-4; }

/* بطاقة متوسطة */
.card-md { @apply p-6; }

/* بطاقة كبيرة */
.card-lg { @apply p-8; }
```

### بين العناصر (Element Spacing)
```tsx
// Vertical spacing between elements
<div className="space-y-2">  {/* 8px */}
<div className="space-y-4">  {/* 16px */}
<div className="space-y-6">  {/* 24px */}
<div className="space-y-8">  {/* 32px */}

// Horizontal spacing
<div className="space-x-2">  {/* 8px - لا يعمل في RTL */}
<div className="flex gap-2">  {/* 8px - يعمل في RTL ✅ */}
```

---

## ✅ Best Practices

### 1. Container
- ✅ استخدم `max-w-7xl` للصفحات العادية
- ✅ استخدم `mx-auto` للتوسيط
- ✅ أضف `px-4 sm:px-6 lg:px-8` دائماً
- ❌ لا تستخدم width: 100% بدون max-width

### 2. Grid
- ✅ ابدأ بـ `grid-cols-1` للموبايل
- ✅ استخدم `gap-4` أو `gap-6` للمسافات
- ✅ استخدم `sm:` و `md:` و `lg:` للتدرج
- ❌ لا تضع أكثر من 4 أعمدة على الديسكتوب

### 3. Flexbox
- ✅ استخدم `flex gap-3` بدلاً من `space-x-`
- ✅ استخدم `items-center` للمحاذاة الرأسية
- ✅ استخدم `justify-between` للتوزيع
- ❌ تجنب `space-x-` في RTL

### 4. Responsive
- ✅ Mobile First: ابدأ من الموبايل
- ✅ اختبر على 320px (أصغر شاشة)
- ✅ استخدم `hidden md:block` للإخفاء/الإظهار
- ❌ لا تفترض حجم شاشة ثابت

### 5. RTL
- ✅ استخدم `start/end` بدلاً من `left/right`
- ✅ استخدم `ps/pe` بدلاً من `pl/pr`
- ✅ استخدم `flex gap-` بدلاً من `space-x-`
- ❌ لا تستخدم absolute positioning بـ left/right

---

## 🎯 أمثلة كاملة من المشروع

### مثال 1: صفحة المتجر الرئيسية
```tsx
function ShopHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1>تسوق أفضل المنتجات</h1>
              <p className="text-gray-600 dark:text-gray-400">
                اكتشف مجموعتنا الواسعة من المنتجات عالية الجودة
              </p>
              <Button size="lg">تصفح المنتجات</Button>
            </div>
            <div>
              <img src={heroImage} alt="Hero" className="rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories */}
      <section className="py-12 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center mb-8">التصنيفات</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8">المنتجات المميزة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

### مثال 2: لوحة تحكم الإدارة
```tsx
function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1>لوحة التحكم</h1>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="المبيعات" value="125,000 ريال" icon={<DollarSign />} />
          <StatCard title="الطلبات" value="1,234" icon={<ShoppingBag />} />
          <StatCard title="العملاء" value="456" icon={<Users />} />
          <StatCard title="المنتجات" value="89" icon={<Package />} />
        </div>
        
        {/* Charts & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SalesChart />
            <RecentOrders />
          </div>
          <div className="space-y-6">
            <TopProducts />
            <ActivityFeed />
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## 📚 المراجع

### الملفات ذات الصلة
- `/App.tsx` - الـ Layout الرئيسي
- `/components/shop/Navbar.tsx` - شريط التنقل
- `/pages/ShopHomePage.tsx` - الصفحة الرئيسية
- `/pages/dashboard/AdminDashboard.tsx` - لوحة التحكم

### مصادر إضافية
- [Tailwind CSS Grid](https://tailwindcss.com/docs/grid-template-columns)
- [Tailwind CSS Flexbox](https://tailwindcss.com/docs/flex)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)

---

**آخر تحديث:** ديسمبر 2025  
**الإصدار:** 1.0  
**اللغة:** العربية (RTL)
