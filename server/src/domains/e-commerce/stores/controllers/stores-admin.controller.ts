import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../../shared/admin/guards/admin.guard';
import { PermissionsGuard } from '../../../shared/admin/guards/permissions.guard';
import { RequireStorePermission } from '../../../shared/admin/decorators/permissions.decorator';
import {
  StoreOwnerProfile,
  StoreOwnerProfileDocument,
} from '../../../../database/schemas';

@Controller('admin/stores')
@UseGuards(JwtAuthGuard, AdminGuard)
export class StoresAdminController {
  constructor(
    @InjectModel(StoreOwnerProfile.name)
    private readonly storeOwnerProfileModel: Model<StoreOwnerProfileDocument>,
  ) {}

  /**
   * Get all stores (Admin only - includes all statuses)
   */
  @Get()
  @UseGuards(PermissionsGuard)
  @RequireStorePermission('view')
  @HttpCode(HttpStatus.OK)
  async getAllStores(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('verificationStatus') verificationStatus?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    const skip = (pageNum - 1) * limitNum;

    // Build query - Admin can see ALL stores
    const query: any = {};

    // Filter by status (active/inactive/suspended)
    if (status === 'active') {
      query.isStoreActive = true;
      query.isStoreSuspended = false;
    } else if (status === 'inactive') {
      query.isStoreActive = false;
    } else if (status === 'suspended') {
      query.isStoreSuspended = true;
    }

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
    if (verificationStatus && verificationStatus !== 'all') {
      query.verificationStatus = verificationStatus;
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
      .select(
        'storeName storeDescription storeLogo storeBanner rating totalReviews totalSales primaryCategory storeCategories verificationStatus isStoreActive isStoreSuspended createdAt accountId',
      )
      .populate('primaryCategory', 'name slug icon')
      .populate('storeCategories', 'name slug icon')
      .populate('accountId', 'fullName email phone')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean()
      .exec();

    // Transform data to handle missing account
    const transformedStores = stores.map((store: any) => ({
      ...store,
      owner: store.accountId
        ? {
            fullName: store.accountId.fullName || 'غير محدد',
            email: store.accountId.email || '',
            phone: store.accountId.phone || '',
          }
        : {
            fullName: 'صاحب المتجر غير محدد',
            email: '',
            phone: '',
          },
      // Keep accountId as is for compatibility
      accountId: store.accountId?._id || store.accountId,
    }));

    // Get total count
    const total = await this.storeOwnerProfileModel.countDocuments(query);

    return {
      success: true,
      data: transformedStores,
      count: transformedStores.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Get store by ID (Admin)
   */
  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequireStorePermission('view')
  @HttpCode(HttpStatus.OK)
  async getStoreById(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: 'Invalid store ID',
      };
    }

    const store = await this.storeOwnerProfileModel
      .findById(id)
      .populate('primaryCategory', 'name slug icon')
      .populate('storeCategories', 'name slug icon')
      .populate('accountId', 'fullName email phone')
      .exec();

    if (!store) {
      return {
        success: false,
        message: 'Store not found',
      };
    }

    return {
      success: true,
      data: store,
    };
  }
}

