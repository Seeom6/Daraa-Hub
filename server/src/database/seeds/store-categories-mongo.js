// MongoDB script to seed store categories
// Run with: mongosh daraa < store-categories-mongo.js

const db = db.getSiblingDB('daraa');

print('🌱 بدء إضافة تصنيفات المتاجر...\n');

// حذف التصنيفات الموجودة (اختياري)
// db.storecategories.deleteMany({});

const categories = [];
const categoryMap = {};

// 1. مطاعم وأطعمة
const restaurantsId = new ObjectId();
categoryMap['restaurants-food'] = restaurantsId;
categories.push({
  _id: restaurantsId,
  name: 'مطاعم وأطعمة',
  slug: 'restaurants-food',
  description: 'مطاعم، مقاهي، حلويات، وجميع أنواع الأطعمة',
  icon: '🍽️',
  level: 0,
  order: 1,
  isActive: true,
  storeCount: 0,
  seoTitle: 'مطاعم وأطعمة في درعا',
  seoDescription: 'اطلب من أفضل المطاعم والمقاهي في درعا',
  seoKeywords: ['مطاعم', 'أطعمة', 'وجبات', 'توصيل طعام'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 2. ملابس وأزياء
const fashionId = new ObjectId();
categoryMap['fashion-clothing'] = fashionId;
categories.push({
  _id: fashionId,
  name: 'ملابس وأزياء',
  slug: 'fashion-clothing',
  description: 'ملابس، أحذية، إكسسوارات، مجوهرات',
  icon: '👔',
  level: 0,
  order: 2,
  isActive: true,
  storeCount: 0,
  seoTitle: 'ملابس وأزياء في درعا',
  seoDescription: 'تسوق أحدث صيحات الموضة والأزياء',
  seoKeywords: ['ملابس', 'أزياء', 'موضة', 'أحذية'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 3. سوبر ماركت ومواد غذائية
const supermarketId = new ObjectId();
categoryMap['supermarket-groceries'] = supermarketId;
categories.push({
  _id: supermarketId,
  name: 'سوبر ماركت ومواد غذائية',
  slug: 'supermarket-groceries',
  description: 'مواد غذائية، خضار، فواكه، ألبان',
  icon: '🛒',
  level: 0,
  order: 3,
  isActive: true,
  storeCount: 0,
  seoTitle: 'سوبر ماركت ومواد غذائية في درعا',
  seoDescription: 'اطلب احتياجاتك اليومية من المواد الغذائية',
  seoKeywords: ['سوبر ماركت', 'مواد غذائية', 'خضار', 'فواكه'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 4. إلكترونيات وتقنية
const electronicsId = new ObjectId();
categoryMap['electronics-technology'] = electronicsId;
categories.push({
  _id: electronicsId,
  name: 'إلكترونيات وتقنية',
  slug: 'electronics-technology',
  description: 'هواتف، حواسيب، كاميرات، ألعاب إلكترونية',
  icon: '📱',
  level: 0,
  order: 4,
  isActive: true,
  storeCount: 0,
  seoTitle: 'إلكترونيات وتقنية في درعا',
  seoDescription: 'تسوق أحدث الأجهزة الإلكترونية والتقنية',
  seoKeywords: ['إلكترونيات', 'هواتف', 'حواسيب', 'تقنية'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 5. منزل وأثاث
const homeId = new ObjectId();
categoryMap['home-furniture'] = homeId;
categories.push({
  _id: homeId,
  name: 'منزل وأثاث',
  slug: 'home-furniture',
  description: 'أثاث، ديكور، أدوات منزلية',
  icon: '🏠',
  level: 0,
  order: 5,
  isActive: true,
  storeCount: 0,
  seoTitle: 'منزل وأثاث في درعا',
  seoDescription: 'تسوق أثاث وديكور منزلي',
  seoKeywords: ['أثاث', 'ديكور', 'منزل', 'مفروشات'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 6. صحة وجمال
const healthId = new ObjectId();
categoryMap['health-beauty'] = healthId;
categories.push({
  _id: healthId,
  name: 'صحة وجمال',
  slug: 'health-beauty',
  description: 'مستحضرات تجميل، عناية شخصية، صيدليات',
  icon: '💄',
  level: 0,
  order: 6,
  isActive: true,
  storeCount: 0,
  seoTitle: 'صحة وجمال في درعا',
  seoDescription: 'منتجات العناية الشخصية والجمال',
  seoKeywords: ['صحة', 'جمال', 'عناية شخصية', 'مستحضرات تجميل'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 7. كتب وقرطاسية
const booksId = new ObjectId();
categoryMap['books-stationery'] = booksId;
categories.push({
  _id: booksId,
  name: 'كتب وقرطاسية',
  slug: 'books-stationery',
  description: 'كتب، قرطاسية، أدوات مكتبية',
  icon: '📚',
  level: 0,
  order: 7,
  isActive: true,
  storeCount: 0,
  seoTitle: 'كتب وقرطاسية في درعا',
  seoDescription: 'تسوق الكتب والأدوات المكتبية',
  seoKeywords: ['كتب', 'قرطاسية', 'أدوات مكتبية'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 8. ألعاب وهدايا
const toysId = new ObjectId();
categoryMap['toys-gifts'] = toysId;
categories.push({
  _id: toysId,
  name: 'ألعاب وهدايا',
  slug: 'toys-gifts',
  description: 'ألعاب أطفال، هدايا، مستلزمات حفلات',
  icon: '🎁',
  level: 0,
  order: 8,
  isActive: true,
  storeCount: 0,
  seoTitle: 'ألعاب وهدايا في درعا',
  seoDescription: 'ألعاب أطفال وهدايا مميزة',
  seoKeywords: ['ألعاب', 'هدايا', 'ألعاب أطفال'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 9. سيارات وقطع غيار
const automotiveId = new ObjectId();
categoryMap['automotive'] = automotiveId;
categories.push({
  _id: automotiveId,
  name: 'سيارات وقطع غيار',
  slug: 'automotive',
  description: 'قطع غيار، إكسسوارات سيارات، زيوت',
  icon: '🚗',
  level: 0,
  order: 9,
  isActive: true,
  storeCount: 0,
  seoTitle: 'سيارات وقطع غيار في درعا',
  seoDescription: 'قطع غيار وإكسسوارات السيارات',
  seoKeywords: ['سيارات', 'قطع غيار', 'إكسسوارات سيارات'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// 10. خدمات
const servicesId = new ObjectId();
categoryMap['services'] = servicesId;
categories.push({
  _id: servicesId,
  name: 'خدمات',
  slug: 'services',
  description: 'صيانة، تنظيف، شحن وتوصيل',
  icon: '🔧',
  level: 0,
  order: 10,
  isActive: true,
  storeCount: 0,
  seoTitle: 'خدمات في درعا',
  seoDescription: 'خدمات الصيانة والتنظيف والتوصيل',
  seoKeywords: ['خدمات', 'صيانة', 'تنظيف', 'توصيل'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// إضافة التصنيفات الرئيسية
try {
  const result = db.storecategories.insertMany(categories);
  print(`✅ تم إضافة ${result.insertedIds.length} تصنيف رئيسي\n`);
} catch (error) {
  print(`❌ خطأ: ${error.message}\n`);
}

// التصنيفات الفرعية
const subcategories = [
  // مطاعم وأطعمة - فرعية
  {
    name: 'مطاعم وجبات سريعة',
    slug: 'fast-food',
    description: 'برجر، بيتزا، ساندويشات، وجبات سريعة',
    icon: '🍕',
    parentCategory: categoryMap['restaurants-food'],
    level: 1,
    order: 1,
    isActive: true,
    storeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'مقاهي',
    slug: 'cafes',
    description: 'قهوة، مشروبات ساخنة وباردة',
    icon: '☕',
    parentCategory: categoryMap['restaurants-food'],
    level: 1,
    order: 2,
    isActive: true,
    storeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'حلويات ومعجنات',
    slug: 'sweets-bakery',
    description: 'حلويات شرقية وغربية، معجنات، كيك',
    icon: '🍰',
    parentCategory: categoryMap['restaurants-food'],
    level: 1,
    order: 3,
    isActive: true,
    storeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// إضافة التصنيفات الفرعية
try {
  const result = db.storecategories.insertMany(subcategories);
  print(`✅ تم إضافة ${result.insertedIds.length} تصنيف فرعي\n`);
} catch (error) {
  print(`❌ خطأ: ${error.message}\n`);
}

print('✅ تم إضافة تصنيفات المتاجر بنجاح!\n');

// عرض الملخص
const totalCategories = db.storecategories.countDocuments();
const rootCategories = db.storecategories.countDocuments({ level: 0 });
const subCategories = db.storecategories.countDocuments({ level: 1 });

print('📊 الملخص:');
print(`  - التصنيفات الرئيسية: ${rootCategories}`);
print(`  - التصنيفات الفرعية: ${subCategories}`);
print(`  - المجموع: ${totalCategories}\n`);

