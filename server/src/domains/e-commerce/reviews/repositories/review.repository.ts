import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../../../../database/schemas/review.schema';
import { BaseRepository } from '../../../shared/base/base.repository';

@Injectable()
export class ReviewRepository extends BaseRepository<ReviewDocument> {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {
    super(reviewModel);
  }

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
  }
}
