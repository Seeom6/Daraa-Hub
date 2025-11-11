import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { StoreCategoriesService } from '../../domains/shared/store-categories/services/store-categories.service';
import { storeCategoriesSeed } from './store-categories.seed';

async function seedStoreCategories() {
  console.log('🌱 بدء إضافة تصنيفات المتاجر...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const storeCategoriesService = app.get(StoreCategoriesService);

  try {
    // خريطة لتخزين IDs التصنيفات الرئيسية
    const categoryMap = new Map<string, string>();

    // المرحلة 1: إضافة التصنيفات الرئيسية (level 0)
    console.log('📁 إضافة التصنيفات الرئيسية...');
    const rootCategories = storeCategoriesSeed.filter(cat => cat.level === 0);
    
    for (const categoryData of rootCategories) {
      try {
        const category = await storeCategoriesService.create({
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          icon: categoryData.icon,
          level: categoryData.level,
          order: categoryData.order,
          isActive: categoryData.isActive,
          seoTitle: categoryData.seoTitle,
          seoDescription: categoryData.seoDescription,
          seoKeywords: categoryData.seoKeywords,
        });
        
        categoryMap.set(categoryData.slug, (category as any)._id.toString());
        console.log(`  ✅ ${categoryData.name} (${categoryData.slug})`);
      } catch (error) {
        if (error.message.includes('موجود مسبقاً')) {
          console.log(`  ⏭️  ${categoryData.name} - موجود مسبقاً`);
          // الحصول على ID من قاعدة البيانات
          const existing = await storeCategoriesService.findBySlug(categoryData.slug);
          categoryMap.set(categoryData.slug, (existing as any)._id.toString());
        } else {
          console.error(`  ❌ خطأ في ${categoryData.name}:`, error.message);
        }
      }
    }

    // المرحلة 2: إضافة التصنيفات الفرعية (level 1)
    console.log('\n📂 إضافة التصنيفات الفرعية...');
    const subCategories = storeCategoriesSeed.filter(cat => cat.level === 1);
    
    for (const categoryData of subCategories) {
      try {
        const parentSlug = (categoryData as any).parentSlug;
        const parentId = categoryMap.get(parentSlug);

        if (!parentId) {
          console.error(`  ❌ التصنيف الأب غير موجود: ${parentSlug}`);
          continue;
        }

        const category = await storeCategoriesService.create({
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          icon: categoryData.icon,
          parentCategory: parentId,
          level: categoryData.level,
          order: categoryData.order,
          isActive: categoryData.isActive,
        });
        
        console.log(`  ✅ ${categoryData.name} (${categoryData.slug})`);
      } catch (error) {
        if (error.message.includes('موجود مسبقاً')) {
          console.log(`  ⏭️  ${categoryData.name} - موجود مسبقاً`);
        } else {
          console.error(`  ❌ خطأ في ${categoryData.name}:`, error.message);
        }
      }
    }

    console.log('\n✅ تم إضافة تصنيفات المتاجر بنجاح!\n');

    // عرض ملخص
    const allCategories = await storeCategoriesService.findAll();
    const rootCount = allCategories.filter(c => c.level === 0).length;
    const subCount = allCategories.filter(c => c.level === 1).length;
    
    console.log('📊 الملخص:');
    console.log(`  - التصنيفات الرئيسية: ${rootCount}`);
    console.log(`  - التصنيفات الفرعية: ${subCount}`);
    console.log(`  - المجموع: ${allCategories.length}\n`);

  } catch (error) {
    console.error('❌ خطأ في إضافة التصنيفات:', error);
  } finally {
    await app.close();
  }
}

// تشغيل السكريبت
seedStoreCategories()
  .then(() => {
    console.log('✅ انتهى السكريبت بنجاح');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ فشل السكريبت:', error);
    process.exit(1);
  });

