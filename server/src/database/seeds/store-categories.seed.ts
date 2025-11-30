/**
 * Store Categories Seed Data
 * بيانات تصنيفات المتاجر الأولية
 */

export const storeCategoriesSeed = [
  // 1. مطاعم وأطعمة
  {
    name: 'مطاعم وأطعمة',
    slug: 'restaurants-food',
    description: 'مطاعم، مقاهي، حلويات، وجميع أنواع الأطعمة',
    icon: '🍽️',
    level: 0,
    order: 1,
    isActive: true,
    seoTitle: 'مطاعم وأطعمة في درعا',
    seoDescription: 'اطلب من أفضل المطاعم والمقاهي في درعا',
    seoKeywords: ['مطاعم', 'أطعمة', 'وجبات', 'توصيل طعام'],
  },
  {
    name: 'مطاعم وجبات سريعة',
    slug: 'fast-food',
    description: 'برجر، بيتزا، ساندويشات، وجبات سريعة',
    icon: '🍕',
    parentSlug: 'restaurants-food',
    level: 1,
    order: 1,
    isActive: true,
  },
  {
    name: 'مطاعم فاخرة',
    slug: 'fine-dining',
    description: 'مطاعم راقية وأطباق فاخرة',
    icon: '🍽️',
    parentSlug: 'restaurants-food',
    level: 1,
    order: 2,
    isActive: true,
  },
  {
    name: 'مقاهي',
    slug: 'cafes',
    description: 'قهوة، مشروبات ساخنة وباردة',
    icon: '☕',
    parentSlug: 'restaurants-food',
    level: 1,
    order: 3,
    isActive: true,
  },
  {
    name: 'حلويات ومعجنات',
    slug: 'sweets-bakery',
    description: 'حلويات شرقية وغربية، معجنات، كيك',
    icon: '🍰',
    parentSlug: 'restaurants-food',
    level: 1,
    order: 4,
    isActive: true,
  },
  {
    name: 'مشاوي',
    slug: 'grills',
    description: 'مشاوي، كباب، شاورما',
    icon: '🍗',
    parentSlug: 'restaurants-food',
    level: 1,
    order: 5,
    isActive: true,
  },

  // 2. ملابس وأزياء
  {
    name: 'ملابس وأزياء',
    slug: 'fashion-clothing',
    description: 'ملابس، أحذية، إكسسوارات، مجوهرات',
    icon: '👔',
    level: 0,
    order: 2,
    isActive: true,
    seoTitle: 'ملابس وأزياء في درعا',
    seoDescription: 'تسوق أحدث صيحات الموضة والأزياء',
    seoKeywords: ['ملابس', 'أزياء', 'موضة', 'أحذية'],
  },
  {
    name: 'ملابس رجالية',
    slug: 'mens-clothing',
    description: 'ملابس وأزياء رجالية',
    icon: '👔',
    parentSlug: 'fashion-clothing',
    level: 1,
    order: 1,
    isActive: true,
  },
  {
    name: 'ملابس نسائية',
    slug: 'womens-clothing',
    description: 'ملابس وأزياء نسائية',
    icon: '👗',
    parentSlug: 'fashion-clothing',
    level: 1,
    order: 2,
    isActive: true,
  },
  {
    name: 'ملابس أطفال',
    slug: 'kids-clothing',
    description: 'ملابس وأزياء للأطفال',
    icon: '👶',
    parentSlug: 'fashion-clothing',
    level: 1,
    order: 3,
    isActive: true,
  },
  {
    name: 'أحذية',
    slug: 'shoes',
    description: 'أحذية رجالية ونسائية وأطفال',
    icon: '👟',
    parentSlug: 'fashion-clothing',
    level: 1,
    order: 4,
    isActive: true,
  },
  {
    name: 'حقائب وإكسسوارات',
    slug: 'bags-accessories',
    description: 'حقائب، محافظ، إكسسوارات',
    icon: '👜',
    parentSlug: 'fashion-clothing',
    level: 1,
    order: 5,
    isActive: true,
  },

  // 3. سوبر ماركت ومواد غذائية
  {
    name: 'سوبر ماركت ومواد غذائية',
    slug: 'supermarket-groceries',
    description: 'مواد غذائية، خضار، فواكه، ألبان',
    icon: '🛒',
    level: 0,
    order: 3,
    isActive: true,
    seoTitle: 'سوبر ماركت ومواد غذائية في درعا',
    seoDescription: 'اطلب احتياجاتك اليومية من المواد الغذائية',
    seoKeywords: ['سوبر ماركت', 'مواد غذائية', 'خضار', 'فواكه'],
  },
  {
    name: 'خضار وفواكه',
    slug: 'vegetables-fruits',
    description: 'خضار وفواكه طازجة',
    icon: '🥬',
    parentSlug: 'supermarket-groceries',
    level: 1,
    order: 1,
    isActive: true,
  },
  {
    name: 'ألبان ومشتقاتها',
    slug: 'dairy-products',
    description: 'حليب، لبن، جبن، زبدة',
    icon: '🥛',
    parentSlug: 'supermarket-groceries',
    level: 1,
    order: 2,
    isActive: true,
  },
  {
    name: 'مخابز',
    slug: 'bakeries',
    description: 'خبز، معجنات، مناقيش',
    icon: '🍞',
    parentSlug: 'supermarket-groceries',
    level: 1,
    order: 3,
    isActive: true,
  },

  // 4. إلكترونيات وتقنية
  {
    name: 'إلكترونيات وتقنية',
    slug: 'electronics-technology',
    description: 'هواتف، حواسيب، كاميرات، ألعاب إلكترونية',
    icon: '📱',
    level: 0,
    order: 4,
    isActive: true,
    seoTitle: 'إلكترونيات وتقنية في درعا',
    seoDescription: 'تسوق أحدث الأجهزة الإلكترونية والتقنية',
    seoKeywords: ['إلكترونيات', 'هواتف', 'حواسيب', 'تقنية'],
  },
  {
    name: 'هواتف ذكية',
    slug: 'smartphones',
    description: 'هواتف ذكية وإكسسواراتها',
    icon: '📱',
    parentSlug: 'electronics-technology',
    level: 1,
    order: 1,
    isActive: true,
  },
  {
    name: 'حواسيب ولابتوبات',
    slug: 'computers-laptops',
    description: 'حواسيب مكتبية ومحمولة',
    icon: '💻',
    parentSlug: 'electronics-technology',
    level: 1,
    order: 2,
    isActive: true,
  },

  // 5. منزل وأثاث
  {
    name: 'منزل وأثاث',
    slug: 'home-furniture',
    description: 'أثاث، ديكور، أدوات منزلية',
    icon: '🏠',
    level: 0,
    order: 5,
    isActive: true,
    seoTitle: 'منزل وأثاث في درعا',
    seoDescription: 'تسوق أثاث وديكور منزلي',
    seoKeywords: ['أثاث', 'ديكور', 'منزل', 'مفروشات'],
  },
  {
    name: 'أثاث',
    slug: 'furniture',
    description: 'أثاث غرف نوم، صالونات، طاولات',
    icon: '🛋️',
    parentSlug: 'home-furniture',
    level: 1,
    order: 1,
    isActive: true,
  },
  {
    name: 'ديكور منزلي',
    slug: 'home-decor',
    description: 'ديكورات، لوحات، إضاءة',
    icon: '🖼️',
    parentSlug: 'home-furniture',
    level: 1,
    order: 2,
    isActive: true,
  },

  // 6. صحة وجمال
  {
    name: 'صحة وجمال',
    slug: 'health-beauty',
    description: 'مستحضرات تجميل، عناية شخصية، صيدليات',
    icon: '💄',
    level: 0,
    order: 6,
    isActive: true,
    seoTitle: 'صحة وجمال في درعا',
    seoDescription: 'منتجات العناية الشخصية والجمال',
    seoKeywords: ['صحة', 'جمال', 'عناية شخصية', 'مستحضرات تجميل'],
  },
  {
    name: 'مستحضرات تجميل',
    slug: 'cosmetics',
    description: 'مكياج، عطور، عناية بالبشرة',
    icon: '💄',
    parentSlug: 'health-beauty',
    level: 1,
    order: 1,
    isActive: true,
  },
  {
    name: 'صيدليات',
    slug: 'pharmacies',
    description: 'أدوية، مكملات غذائية',
    icon: '💊',
    parentSlug: 'health-beauty',
    level: 1,
    order: 2,
    isActive: true,
  },

  // 7. كتب وقرطاسية
  {
    name: 'كتب وقرطاسية',
    slug: 'books-stationery',
    description: 'كتب، قرطاسية، أدوات مكتبية',
    icon: '📚',
    level: 0,
    order: 7,
    isActive: true,
    seoTitle: 'كتب وقرطاسية في درعا',
    seoDescription: 'تسوق الكتب والأدوات المكتبية',
    seoKeywords: ['كتب', 'قرطاسية', 'أدوات مكتبية'],
  },

  // 8. ألعاب وهدايا
  {
    name: 'ألعاب وهدايا',
    slug: 'toys-gifts',
    description: 'ألعاب أطفال، هدايا، مستلزمات حفلات',
    icon: '🎁',
    level: 0,
    order: 8,
    isActive: true,
    seoTitle: 'ألعاب وهدايا في درعا',
    seoDescription: 'ألعاب أطفال وهدايا مميزة',
    seoKeywords: ['ألعاب', 'هدايا', 'ألعاب أطفال'],
  },

  // 9. سيارات وقطع غيار
  {
    name: 'سيارات وقطع غيار',
    slug: 'automotive',
    description: 'قطع غيار، إكسسوارات سيارات، زيوت',
    icon: '🚗',
    level: 0,
    order: 9,
    isActive: true,
    seoTitle: 'سيارات وقطع غيار في درعا',
    seoDescription: 'قطع غيار وإكسسوارات السيارات',
    seoKeywords: ['سيارات', 'قطع غيار', 'إكسسوارات سيارات'],
  },

  // 10. خدمات
  {
    name: 'خدمات',
    slug: 'services',
    description: 'صيانة، تنظيف، شحن وتوصيل',
    icon: '🔧',
    level: 0,
    order: 10,
    isActive: true,
    seoTitle: 'خدمات في درعا',
    seoDescription: 'خدمات الصيانة والتنظيف والتوصيل',
    seoKeywords: ['خدمات', 'صيانة', 'تنظيف', 'توصيل'],
  },
];
