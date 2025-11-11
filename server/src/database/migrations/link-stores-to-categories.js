/**
 * Migration Script: Link Existing Stores to Default Categories
 * 
 * هذا السكريبت يربط المتاجر الموجودة بتصنيف افتراضي
 * يمكن تشغيله باستخدام:
 * mongosh daraa < src/database/migrations/link-stores-to-categories.js
 */

// الاتصال بقاعدة البيانات
const db = db.getSiblingDB('daraa');

print('🔗 بدء ربط المتاجر بالتصنيفات...\n');

// الحصول على التصنيف الافتراضي (سوبر ماركت ومواد غذائية)
const defaultCategory = db.storecategories.findOne({ slug: 'supermarket-groceries' });

if (!defaultCategory) {
  print('❌ خطأ: التصنيف الافتراضي غير موجود');
  print('يرجى تشغيل seed-store-categories أولاً\n');
  quit(1);
}

print(`✅ التصنيف الافتراضي: ${defaultCategory.name} (${defaultCategory._id})\n`);

// الحصول على جميع المتاجر التي ليس لها تصنيفات
const storesWithoutCategories = db.storeownerprofiles.find({
  $or: [
    { storeCategories: { $exists: false } },
    { storeCategories: { $size: 0 } },
    { storeCategories: null },
  ],
}).toArray();

print(`📊 عدد المتاجر بدون تصنيفات: ${storesWithoutCategories.length}\n`);

if (storesWithoutCategories.length === 0) {
  print('✅ جميع المتاجر لديها تصنيفات بالفعل\n');
  quit(0);
}

// ربط المتاجر بالتصنيف الافتراضي
let updatedCount = 0;
let errorCount = 0;

storesWithoutCategories.forEach((store) => {
  try {
    const result = db.storeownerprofiles.updateOne(
      { _id: store._id },
      {
        $set: {
          primaryCategory: defaultCategory._id,
          storeCategories: [defaultCategory._id],
        },
      }
    );

    if (result.modifiedCount > 0) {
      updatedCount++;
      print(`  ✅ ${store.storeName || 'متجر بدون اسم'} (${store._id})`);
    }
  } catch (error) {
    errorCount++;
    print(`  ❌ خطأ في ${store._id}: ${error.message}`);
  }
});

print(`\n📊 النتائج:`);
print(`  - تم التحديث: ${updatedCount}`);
print(`  - أخطاء: ${errorCount}`);
print(`  - المجموع: ${storesWithoutCategories.length}\n`);

// تحديث عدد المتاجر في التصنيف
const storeCount = db.storeownerprofiles.countDocuments({
  storeCategories: defaultCategory._id,
});

db.storecategories.updateOne(
  { _id: defaultCategory._id },
  { $set: { storeCount: storeCount } }
);

print(`✅ تم تحديث عدد المتاجر في التصنيف: ${storeCount}\n`);
print('✅ اكتمل الربط بنجاح!\n');

