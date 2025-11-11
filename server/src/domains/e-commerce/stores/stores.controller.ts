import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StoreOwnerProfile, StoreOwnerProfileDocument } from '../../../database/schemas';

@Controller('stores')
export class StoresController {
  constructor(
    @InjectModel(StoreOwnerProfile.name)
    private storeOwnerProfileModel: Model<StoreOwnerProfileDocument>,
  ) {}

  /**
   * الحصول على جميع المتاجر (عام)
   * GET /stores
   */
  @Get()
  async getAllStores(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('verified') verified?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {
      isStoreActive: true,
    };

    // Search by store name or description
    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { storeDescription: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category && Types.ObjectId.isValid(category)) {
      query.storeCategories = new Types.ObjectId(category);
    }

    // Filter by verification status
    if (verified === 'true') {
      query.verificationStatus = 'approved';
    }

    // Build sort
    let sortOption: any = { createdAt: -1 }; // Default: newest first
    if (sort === 'rating') {
      sortOption = { rating: -1, totalReviews: -1 };
    } else if (sort === 'reviews') {
      sortOption = { totalReviews: -1, rating: -1 };
    } else if (sort === 'sales') {
      sortOption = { totalSales: -1 };
    } else if (sort === 'name') {
      sortOption = { storeName: 1 };
    }

    // Get stores
    const stores = await this.storeOwnerProfileModel
      .find(query)
      .select('storeName storeDescription storeLogo storeBanner rating totalReviews totalSales primaryCategory storeCategories verificationStatus createdAt')
      .populate('primaryCategory', 'name slug icon')
      .populate('storeCategories', 'name slug icon')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .exec();

    // Get total count
    const total = await this.storeOwnerProfileModel.countDocuments(query);

    return {
      success: true,
      data: stores,
      count: stores.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * الحصول على متجر واحد (عام)
   * GET /stores/:id
   */
  @Get(':id')
  async getStoreById(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('معرف المتجر غير صحيح');
    }

    const store = await this.storeOwnerProfileModel
      .findOne({
        _id: new Types.ObjectId(id),
        isStoreActive: true,
      })
      .select('-accountId -verificationReviewedBy -storeSuspendedBy')
      .populate('primaryCategory', 'name slug icon description')
      .populate('storeCategories', 'name slug icon description')
      .exec();

    if (!store) {
      throw new NotFoundException('المتجر غير موجود');
    }

    return {
      success: true,
      data: store,
    };
  }
}

