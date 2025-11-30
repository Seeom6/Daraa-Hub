import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';

/**
 * Advanced Mock Data Factory for generating test data using Faker
 */
export class FakerDataFactory {
  /**
   * Generate a fake Product
   */
  static createProduct(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      sku: faker.string.alphanumeric(10).toUpperCase(),
      slug: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
      storeId: new Types.ObjectId(),
      store: new Types.ObjectId(),
      categoryId: new Types.ObjectId(),
      category: new Types.ObjectId(),
      images: [faker.image.url()],
      status: 'active',
      stock: faker.number.int({ min: 0, max: 100 }),
      isFeatured: faker.datatype.boolean(),
      isActive: true,
      isDeleted: false,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake Order
   */
  static createOrder(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      orderNumber: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
      customerId: new Types.ObjectId(),
      customer: new Types.ObjectId(),
      storeId: new Types.ObjectId(),
      store: new Types.ObjectId(),
      items: [
        {
          productId: new Types.ObjectId(),
          product: new Types.ObjectId(),
          quantity: faker.number.int({ min: 1, max: 5 }),
          price: parseFloat(faker.commerce.price()),
        },
      ],
      totalAmount: parseFloat(faker.commerce.price({ min: 100, max: 1000 })),
      orderStatus: 'pending',
      paymentStatus: 'pending',
      shippingAddress: FakerDataFactory.createAddress(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake User/Account
   */
  static createAccount(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      phoneNumber: `+963${faker.string.numeric(9)}`,
      role: 'customer',
      isActive: true,
      isVerified: true,
      isDeleted: false,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake Store
   */
  static createStore(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      owner: new Types.ObjectId(),
      logo: faker.image.url(),
      coverImage: faker.image.url(),
      isActive: true,
      isVerified: true,
      isDeleted: false,
      rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
      totalRatings: faker.number.int({ min: 0, max: 1000 }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake Coupon
   */
  static createCoupon(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      code: faker.string.alphanumeric(8).toUpperCase(),
      type: faker.helpers.arrayElement(['percentage', 'fixed']),
      discountValue: faker.number.int({ min: 5, max: 50 }),
      validFrom: faker.date.past(),
      validUntil: faker.date.future(),
      isActive: true,
      usageLimit: faker.number.int({ min: 10, max: 100 }),
      usedCount: 0,
      minOrderAmount: faker.number.int({ min: 0, max: 100 }),
      maxDiscountAmount: faker.number.int({ min: 50, max: 500 }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake Review
   */
  static createReview(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      customerId: new Types.ObjectId(),
      customer: new Types.ObjectId(),
      targetType: faker.helpers.arrayElement(['product', 'store', 'courier']),
      targetId: new Types.ObjectId(),
      rating: faker.number.int({ min: 1, max: 5 }),
      title: faker.lorem.sentence(),
      comment: faker.lorem.paragraph(),
      status: 'approved',
      isVerifiedPurchase: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake Category
   */
  static createCategory(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      name: faker.commerce.department(),
      slug: faker.helpers.slugify(faker.commerce.department()).toLowerCase(),
      description: faker.lorem.sentence(),
      image: faker.image.url(),
      isActive: true,
      isDeleted: false,
      parentId: null,
      order: faker.number.int({ min: 1, max: 100 }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake Address
   */
  static createAddress(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      label: faker.helpers.arrayElement(['home', 'work', 'other']),
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      region: faker.location.state(),
      country: 'Syria',
      postalCode: faker.location.zipCode(),
      latitude: Number(faker.location.latitude()),
      longitude: Number(faker.location.longitude()),
      isDefault: false,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake Inventory
   */
  static createInventory(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      productId: new Types.ObjectId(),
      product: new Types.ObjectId(),
      storeId: new Types.ObjectId(),
      store: new Types.ObjectId(),
      quantity: faker.number.int({ min: 0, max: 1000 }),
      reservedQuantity: faker.number.int({ min: 0, max: 50 }),
      lowStockThreshold: 10,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake Wallet
   */
  static createWallet(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      accountId: new Types.ObjectId(),
      account: new Types.ObjectId(),
      balance: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
      currency: 'SYP',
      isActive: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a fake Notification
   */
  static createNotification(overrides?: Partial<any>) {
    return {
      _id: new Types.ObjectId(),
      accountId: new Types.ObjectId(),
      account: new Types.ObjectId(),
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraph(),
      type: faker.helpers.arrayElement(['order', 'promotion', 'system']),
      isRead: false,
      data: {},
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate multiple items
   */
  static createMany<T>(factory: () => T, count: number): T[] {
    return Array.from({ length: count }, factory);
  }

  /**
   * Generate fake pagination response
   */
  static createPaginatedResponse<T>(
    data: T[],
    total?: number,
    page = 1,
    limit = 10,
  ) {
    const actualTotal = total ?? data.length;
    return {
      data,
      total: actualTotal,
      page,
      limit,
      totalPages: Math.ceil(actualTotal / limit),
      hasNextPage: page < Math.ceil(actualTotal / limit),
      hasPrevPage: page > 1,
    };
  }
}
