import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Return, ReturnDocument } from '../../../../database/schemas/return.schema';
import { BaseRepository } from '../../../shared/base/base.repository';

@Injectable()
export class ReturnRepository extends BaseRepository<ReturnDocument> {
  constructor(
    @InjectModel(Return.name)
    private readonly returnModel: Model<ReturnDocument>,
  ) {
    super(returnModel);
  }

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
  }
}
