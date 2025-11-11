const fs = require('fs');
const path = require('path');

// Repository templates for remaining modules
const repositories = [
  {
    domain: 'e-commerce',
    module: 'offers',
    schema: 'offer',
    className: 'Offer',
    methods: `
  /**
   * Find active offers
   */
  async findActiveOffers(storeId?: string): Promise<OfferDocument[]> {
    const filter: any = {
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    };

    if (storeId) {
      filter.storeId = new Types.ObjectId(storeId);
    }

    return this.find(filter);
  }

  /**
   * Find offers by product ID
   */
  async findByProductId(productId: string): Promise<OfferDocument[]> {
    return this.find({
      productId: new Types.ObjectId(productId),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });
  }`,
  },
  {
    domain: 'e-commerce',
    module: 'reviews',
    schema: 'review',
    className: 'Review',
    methods: `
  /**
   * Find reviews by product ID
   */
  async findByProductId(
    productId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: ReviewDocument[]; total: number }> {
    return this.findWithPagination(
      { productId: new Types.ObjectId(productId), isApproved: true },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Find reviews by customer ID
   */
  async findByCustomerId(
    customerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: ReviewDocument[]; total: number }> {
    return this.findWithPagination(
      { customerId: new Types.ObjectId(customerId) },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Get average rating for product
   */
  async getAverageRating(productId: string): Promise<number> {
    const result = await this.reviewModel.aggregate([
      {
        $match: {
          productId: new Types.ObjectId(productId),
          isApproved: true,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    return result.length > 0 ? result[0].avgRating : 0;
  }`,
  },
  {
    domain: 'e-commerce',
    module: 'payment',
    schema: 'payment',
    className: 'Payment',
    methods: `
  /**
   * Find payment by order ID
   */
  async findByOrderId(orderId: string): Promise<PaymentDocument | null> {
    return this.findOne({ orderId: new Types.ObjectId(orderId) });
  }

  /**
   * Find payments by customer ID
   */
  async findByCustomerId(
    customerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: PaymentDocument[]; total: number }> {
    return this.findWithPagination(
      { customerId: new Types.ObjectId(customerId) },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Update payment status
   */
  async updateStatus(
    paymentId: string,
    status: string,
  ): Promise<PaymentDocument | null> {
    return this.findByIdAndUpdate(paymentId, { status });
  }`,
  },
  {
    domain: 'e-commerce',
    module: 'returns',
    schema: 'return',
    className: 'Return',
    methods: `
  /**
   * Find returns by order ID
   */
  async findByOrderId(orderId: string): Promise<ReturnDocument[]> {
    return this.find({ orderId: new Types.ObjectId(orderId) });
  }

  /**
   * Find returns by customer ID
   */
  async findByCustomerId(
    customerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: ReturnDocument[]; total: number }> {
    return this.findWithPagination(
      { customerId: new Types.ObjectId(customerId) },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Find returns by store ID
   */
  async findByStoreId(
    storeId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: ReturnDocument[]; total: number }> {
    return this.findWithPagination(
      { storeId: new Types.ObjectId(storeId) },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }`,
  },
  {
    domain: 'e-commerce',
    module: 'disputes',
    schema: 'dispute',
    className: 'Dispute',
    methods: `
  /**
   * Find disputes by order ID
   */
  async findByOrderId(orderId: string): Promise<DisputeDocument[]> {
    return this.find({ orderId: new Types.ObjectId(orderId) });
  }

  /**
   * Find disputes by customer ID
   */
  async findByCustomerId(
    customerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: DisputeDocument[]; total: number }> {
    return this.findWithPagination(
      { customerId: new Types.ObjectId(customerId) },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Find disputes by status
   */
  async findByStatus(
    status: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: DisputeDocument[]; total: number }> {
    return this.findWithPagination(
      { status },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }`,
  },
];

function generateRepository(config) {
  const { domain, module, schema, className, methods } = config;
  
  const content = `import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ${className}, ${className}Document } from '../../../../database/schemas/${schema}.schema';
import { BaseRepository } from '../../../shared/base/base.repository';

@Injectable()
export class ${className}Repository extends BaseRepository<${className}Document> {
  constructor(
    @InjectModel(${className}.name)
    private readonly ${schema}Model: Model<${className}Document>,
  ) {
    super(${schema}Model);
  }
${methods}
}
`;

  const filePath = path.join(
    __dirname,
    'src',
    'domains',
    domain,
    module,
    'repositories',
    `${schema}.repository.ts`,
  );

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Created: ${filePath}`);
}

console.log('🔧 Creating repositories...\n');

repositories.forEach((config) => {
  try {
    generateRepository(config);
  } catch (error) {
    console.error(`❌ Error creating ${config.className}Repository:`, error.message);
  }
});

console.log('\n✅ All repositories created!');

