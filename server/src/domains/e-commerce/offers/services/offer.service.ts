import { Injectable, Logger } from '@nestjs/common';
import { OfferDocument } from '../../../../database/schemas/offer.schema';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { UpdateOfferDto } from '../dto/update-offer.dto';
import { QueryOfferDto } from '../dto/query-offer.dto';
import { OfferCrudService } from './offer-crud.service';
import { OfferQueryService } from './offer-query.service';
import { OfferAnalyticsService } from './offer-analytics.service';

/**
 * Offer Service - Facade Pattern
 * Delegates operations to specialized services
 */
@Injectable()
export class OfferService {
  private readonly logger = new Logger(OfferService.name);

  constructor(
    private readonly crudService: OfferCrudService,
    private readonly queryService: OfferQueryService,
    private readonly analyticsService: OfferAnalyticsService,
  ) {}

  // ===== CRUD Operations (delegated to OfferCrudService) =====

  async create(
    createDto: CreateOfferDto,
    storeId: string,
  ): Promise<OfferDocument> {
    return this.crudService.create(createDto, storeId);
  }

  async update(
    id: string,
    updateDto: UpdateOfferDto,
    storeId: string,
  ): Promise<OfferDocument> {
    return this.crudService.update(id, updateDto, storeId);
  }

  async remove(id: string, storeId: string): Promise<void> {
    return this.crudService.remove(id, storeId);
  }

  async adminRemove(id: string): Promise<void> {
    return this.crudService.adminRemove(id);
  }

  // ===== Query Operations (delegated to OfferQueryService) =====

  async findAll(queryDto: QueryOfferDto): Promise<{
    data: OfferDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryService.findAll(queryDto);
  }

  async findOne(id: string): Promise<OfferDocument> {
    return this.queryService.findOne(id);
  }

  async getActiveOffers(storeId: string): Promise<OfferDocument[]> {
    return this.queryService.getActiveOffers(storeId);
  }

  async getOffersForProduct(productId: string): Promise<OfferDocument[]> {
    return this.queryService.getOffersForProduct(productId);
  }

  // ===== Analytics Operations (delegated to OfferAnalyticsService) =====

  async incrementUsageCount(offerId: string): Promise<void> {
    return this.analyticsService.incrementUsageCount(offerId);
  }

  async getAnalytics(
    id: string,
    storeId: string,
  ): Promise<{
    viewCount: number;
    usageCount: number;
    conversionRate: number;
  }> {
    return this.analyticsService.getAnalytics(id, storeId);
  }
}
