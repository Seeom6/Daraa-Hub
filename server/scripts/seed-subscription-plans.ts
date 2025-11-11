import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { SubscriptionPlan } from '../src/database/schemas/subscription-plan.schema';
import { defaultSubscriptionPlans } from '../src/database/seeds/subscription-plans.seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const subscriptionPlanModel = app.get<Model<SubscriptionPlan>>(
    getModelToken(SubscriptionPlan.name),
  );

  console.log('🌱 Seeding subscription plans...\n');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const plan of defaultSubscriptionPlans) {
    try {
      const existing = await subscriptionPlanModel.findOne({ type: plan.type });

      if (existing) {
        // Update existing plan
        await subscriptionPlanModel.updateOne({ type: plan.type }, { $set: plan });
        console.log(`✅ Updated: ${plan.name} (${plan.type})`);
        updated++;
      } else {
        // Create new plan
        await subscriptionPlanModel.create(plan);
        console.log(`✨ Created: ${plan.name} (${plan.type})`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${plan.name}:`, error.message);
      skipped++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✨ Created: ${created}`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ❌ Skipped: ${skipped}`);
  console.log(`   📝 Total: ${defaultSubscriptionPlans.length}`);

  await app.close();
  console.log('\n✅ Done!');
}

bootstrap().catch((error) => {
  console.error('Error seeding subscription plans:', error);
  process.exit(1);
});

