import { Injectable } from '@nestjs/common';
import { CouponDocument } from '../../../../database/schemas/coupon.schema';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { QueryCouponDto } from '../dto/query-coupon.dto';
import { CouponCrudService } from './coupon-crud.service';
import { CouponQueryService } from './coupon-query.service';

/**
 * Coupon Service - Facade
 * Delegates to specialized services for separation of concerns
 */
@Injectable()
export class CouponService {
  constructor(
    private readonly crudService: CouponCrudService,
    private readonly queryService: CouponQueryService,
  ) {}

  // ==================== CRUD Operations ====================

  async create(
    createDto: CreateCouponDto,
    createdBy: string,
  ): Promise<CouponDocument> {
    return this.crudService.create(createDto, createdBy);
  }

  async update(
    id: string,
    updateDto: UpdateCouponDto,
  ): Promise<CouponDocument> {
    return this.crudService.update(id, updateDto);
  }

  async remove(id: string): Promise<void> {
    return this.crudService.remove(id);
  }

  async toggleActive(id: string): Promise<CouponDocument> {
    return this.crudService.toggleActive(id);
  }

  // ==================== Query Operations ====================

  async findAll(queryDto: QueryCouponDto): Promise<{
    data: CouponDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryService.findAll(queryDto);
  }

  async findOne(id: string): Promise<CouponDocument> {
    return this.queryService.findOne(id);
  }

  async findByCode(code: string): Promise<CouponDocument> {
    return this.queryService.findByCode(code);
  }
}
