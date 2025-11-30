import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ClientSession } from 'mongoose';
import {
  CommissionDocument,
  CommissionStatus,
  CommissionType,
} from '../../../../database/schemas/commission.schema';
import { CommissionConfigDocument } from '../../../../database/schemas/commission-config.schema';
import { CommissionRepository } from '../repositories/commission.repository';
import { CommissionConfigRepository } from '../repositories/commission-config.repository';
import { CalculateCommissionDto } from '../dto/commission.dto';

/**
 * Service for commission calculation operations
 * Handles commission calculation and creation
 */
@Injectable()
export class CommissionCalculationService {
  private readonly logger = new Logger(CommissionCalculationService.name);

  constructor(
    private readonly commissionRepo: CommissionRepository,
    private readonly configRepo: CommissionConfigRepository,
  ) {}

  /**
   * حساب وإنشاء سجل العمولة للطلب
   */
  async calculateAndCreateCommission(
    dto: CalculateCommissionDto,
    session?: ClientSession,
  ): Promise<CommissionDocument> {
    const existing = await this.commissionRepo.findByOrderId(dto.orderId);
    if (existing) {
      throw new BadRequestException('العمولة محسوبة مسبقاً لهذا الطلب');
    }

    const config = await this.configRepo.getApplicableConfig(
      dto.storeAccountId,
      dto.storeCategoryId,
    );

    if (!config) {
      throw new NotFoundException('لم يتم العثور على إعدادات العمولة');
    }

    const calculation = this.calculateCommissionAmounts(
      dto.orderAmount,
      dto.deliveryFee || 0,
      config,
    );

    const commission = await this.commissionRepo.createWithSession(
      {
        orderId: dto.orderId as any,
        storeAccountId: dto.storeAccountId as any,
        courierAccountId: dto.courierAccountId as any,
        type: CommissionType.PLATFORM_FEE,
        status: CommissionStatus.PENDING,
        orderAmount: dto.orderAmount,
        commissionRate: config.platformFeeRate,
        commissionAmount: calculation.platformCommission,
        deliveryFee: dto.deliveryFee || 0,
        platformDeliveryCommission: calculation.deliveryCommission,
        storeNetEarnings: calculation.storeNetEarnings,
        courierNetEarnings: calculation.courierNetEarnings,
        platformNetEarnings: calculation.platformNetEarnings,
      },
      session,
    );

    this.logger.log(
      `Commission calculated for order ${dto.orderId}: Platform ${calculation.platformNetEarnings}, Store ${calculation.storeNetEarnings}`,
    );

    return commission;
  }

  /**
   * حساب مبالغ العمولة
   */
  calculateCommissionAmounts(
    orderAmount: number,
    deliveryFee: number,
    config: CommissionConfigDocument,
  ) {
    let platformCommission = (orderAmount * config.platformFeeRate) / 100;

    if (config.minCommission && platformCommission < config.minCommission) {
      platformCommission = config.minCommission;
    }
    if (config.maxCommission && platformCommission > config.maxCommission) {
      platformCommission = config.maxCommission;
    }

    const deliveryCommission =
      (deliveryFee * (config.deliveryFeeRate || 0)) / 100;
    const storeNetEarnings = orderAmount - platformCommission;
    const courierNetEarnings = deliveryFee - deliveryCommission;
    const platformNetEarnings = platformCommission + deliveryCommission;

    return {
      platformCommission: Math.round(platformCommission),
      deliveryCommission: Math.round(deliveryCommission),
      storeNetEarnings: Math.round(storeNetEarnings),
      courierNetEarnings: Math.round(courierNetEarnings),
      platformNetEarnings: Math.round(platformNetEarnings),
    };
  }

  /**
   * تحصيل العمولة (بعد اكتمال الطلب)
   */
  async collectCommission(
    orderId: string,
    session?: ClientSession,
  ): Promise<CommissionDocument> {
    const commission = await this.commissionRepo.findByOrderId(orderId);
    if (!commission) {
      throw new NotFoundException('لم يتم العثور على سجل العمولة');
    }

    if (commission.status !== CommissionStatus.PENDING) {
      throw new BadRequestException('العمولة محصلة مسبقاً أو ملغاة');
    }

    const updated = await this.commissionRepo.updateStatus(
      commission.id,
      CommissionStatus.COLLECTED,
      session,
    );

    this.logger.log(`Commission collected for order ${orderId}`);
    return updated!;
  }

  /**
   * إلغاء العمولة (إذا ألغي الطلب)
   */
  async cancelCommission(orderId: string): Promise<CommissionDocument | null> {
    const commission = await this.commissionRepo.findByOrderId(orderId);
    if (!commission) return null;

    if (commission.status === CommissionStatus.PAID_OUT) {
      throw new BadRequestException('لا يمكن إلغاء عمولة مصروفة');
    }

    return this.commissionRepo.updateStatus(
      commission.id,
      CommissionStatus.CANCELLED,
    );
  }
}
