import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
  PlanType,
} from '../../../database/schemas/subscription-plan.schema';
import { CreatePlanDto, UpdatePlanDto } from '../dto';
import { defaultSubscriptionPlans } from '../../../database/seeds/subscription-plans.seed';

@Injectable()
export class SubscriptionPlanService {
  private readonly logger = new Logger(SubscriptionPlanService.name);

  constructor(
    @InjectModel(SubscriptionPlan.name)
    private readonly planModel: Model<SubscriptionPlanDocument>,
  ) {}

  /**
   * Seed default subscription plans
   */
  async seedDefaultPlans(): Promise<void> {
    const count = await this.planModel.countDocuments().exec();
    if (count > 0) {
      this.logger.log('Subscription plans already exist, skipping seed');
      return;
    }

    await this.planModel.insertMany(defaultSubscriptionPlans);
    this.logger.log('Default subscription plans seeded successfully');
  }

  /**
   * Create a new plan (Admin only)
   */
  async create(createDto: CreatePlanDto): Promise<SubscriptionPlanDocument> {
    // Check if plan type already exists
    const existing = await this.planModel.findOne({ type: createDto.type }).exec();
    if (existing) {
      throw new ConflictException(`Plan with type ${createDto.type} already exists`);
    }

    const plan = new this.planModel(createDto);
    const saved = await plan.save();

    this.logger.log(`Subscription plan created: ${saved.name}`);
    return saved;
  }

  /**
   * Get all plans
   */
  async findAll(activeOnly = false): Promise<SubscriptionPlanDocument[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return await this.planModel.find(filter).sort({ order: 1 }).exec();
  }

  /**
   * Get plan by ID
   */
  async findOne(id: string): Promise<SubscriptionPlanDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid plan ID');
    }

    const plan = await this.planModel.findById(id).exec();
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  /**
   * Get plan by type
   */
  async findByType(type: PlanType): Promise<SubscriptionPlanDocument> {
    const plan = await this.planModel.findOne({ type }).exec();
    if (!plan) {
      throw new NotFoundException(`Subscription plan with type ${type} not found`);
    }

    return plan;
  }

  /**
   * Update plan (Admin only)
   */
  async update(id: string, updateDto: UpdatePlanDto): Promise<SubscriptionPlanDocument> {
    const plan = await this.findOne(id);

    // If changing type, check for conflicts
    if (updateDto.type && updateDto.type !== plan.type) {
      const existing = await this.planModel.findOne({ type: updateDto.type }).exec();
      if (existing) {
        throw new ConflictException(`Plan with type ${updateDto.type} already exists`);
      }
    }

    Object.assign(plan, updateDto);
    const updated = await plan.save();

    this.logger.log(`Subscription plan updated: ${updated.name}`);
    return updated;
  }

  /**
   * Delete plan (Admin only)
   */
  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    await plan.deleteOne();

    this.logger.log(`Subscription plan deleted: ${plan.name}`);
  }
}

