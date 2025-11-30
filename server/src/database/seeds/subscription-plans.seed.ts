import { PlanType } from '../schemas/subscription-plan.schema';

export const defaultSubscriptionPlans = [
  {
    name: 'Basic Plan',
    type: PlanType.BASIC,
    description: 'Perfect for small stores starting out',
    priceUSD: 20,
    priceSYP: 300000, // 20 USD * 15000 SYP
    durationDays: 30,
    features: {
      dailyProductLimit: 2,
      maxImagesPerProduct: 2,
      maxVariantsPerProduct: 5,
      prioritySupport: false,
      analyticsAccess: false,
      customDomain: false,
    },
    isActive: true,
    order: 1,
  },
  {
    name: 'Standard Plan',
    type: PlanType.STANDARD,
    description: 'Great for growing stores',
    priceUSD: 50,
    priceSYP: 750000, // 50 USD * 15000 SYP
    durationDays: 30,
    features: {
      dailyProductLimit: 5,
      maxImagesPerProduct: 4,
      maxVariantsPerProduct: 999, // Unlimited
      prioritySupport: false,
      analyticsAccess: true,
      customDomain: false,
    },
    isActive: true,
    order: 2,
  },
  {
    name: 'Premium Plan',
    type: PlanType.PREMIUM,
    description: 'Best for established stores',
    priceUSD: 100,
    priceSYP: 1500000, // 100 USD * 15000 SYP
    durationDays: 30,
    features: {
      dailyProductLimit: 15,
      maxImagesPerProduct: 6,
      maxVariantsPerProduct: 999, // Unlimited
      prioritySupport: true,
      analyticsAccess: true,
      customDomain: true,
    },
    isActive: true,
    order: 3,
  },
];
