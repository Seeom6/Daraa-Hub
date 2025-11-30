import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Dispute,
  DisputeDocument,
} from '../../../../database/schemas/dispute.schema';
import { BaseRepository } from '../../../shared/base/base.repository';

@Injectable()
export class DisputeRepository extends BaseRepository<DisputeDocument> {
  constructor(
    @InjectModel(Dispute.name)
    private readonly disputeModel: Model<DisputeDocument>,
  ) {
    super(disputeModel);
  }

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
    return this.findWithPagination({ status }, page, limit, {
      sort: { createdAt: -1 },
    });
  }
}
