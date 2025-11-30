import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SystemSettings,
  SystemSettingsDocument,
} from '../../../../database/schemas/system-settings.schema';
import { CreateSettingsDto } from '../dto/create-settings.dto';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { SettingsCacheService } from './settings-cache.service';
import { SettingsDefaultsService } from './settings-defaults.service';

/**
 * Settings Service - Facade Pattern
 * Delegates caching to SettingsCacheService, defaults to SettingsDefaultsService
 */
@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectModel(SystemSettings.name)
    private systemSettingsModel: Model<SystemSettingsDocument>,
    private cacheService: SettingsCacheService,
    private defaultsService: SettingsDefaultsService,
  ) {}

  async create(
    createSettingsDto: CreateSettingsDto,
    adminId: string,
  ): Promise<SystemSettingsDocument> {
    const existing = await this.systemSettingsModel
      .findOne({ key: createSettingsDto.key })
      .exec();
    if (existing) {
      throw new ConflictException(
        `Settings with key '${createSettingsDto.key}' already exist`,
      );
    }

    const settings = new this.systemSettingsModel({
      ...createSettingsDto,
      lastModifiedBy: adminId,
    });

    const saved = await settings.save();
    await this.cacheService.cacheSettings(saved.key, saved);

    this.logger.log(`Settings created: ${saved.key} by admin: ${adminId}`);
    return saved;
  }

  async findAll(category?: string): Promise<SystemSettingsDocument[]> {
    const query = category ? { category } : {};
    return this.systemSettingsModel.find(query).exec();
  }

  async findByKey(key: string): Promise<SystemSettingsDocument> {
    const cached = await this.cacheService.getCachedSettings(key);
    if (cached) {
      return cached;
    }

    const settings = await this.systemSettingsModel.findOne({ key }).exec();
    if (!settings) {
      throw new NotFoundException(`Settings with key '${key}' not found`);
    }

    await this.cacheService.cacheSettings(key, settings);
    return settings;
  }

  async update(
    key: string,
    updateSettingsDto: UpdateSettingsDto,
    adminId: string,
  ): Promise<SystemSettingsDocument> {
    const settings = await this.systemSettingsModel
      .findOneAndUpdate(
        { key },
        { ...updateSettingsDto, lastModifiedBy: adminId },
        { new: true },
      )
      .exec();

    if (!settings) {
      throw new NotFoundException(`Settings with key '${key}' not found`);
    }

    await this.cacheService.cacheSettings(key, settings);
    this.logger.log(`Settings updated: ${key} by admin: ${adminId}`);
    return settings;
  }

  async updateValue(
    key: string,
    value: Record<string, any>,
    adminId: string,
  ): Promise<SystemSettingsDocument> {
    const settings = await this.systemSettingsModel
      .findOneAndUpdate(
        { key },
        { value, lastModifiedBy: adminId },
        { new: true },
      )
      .exec();

    if (!settings) {
      throw new NotFoundException(`Settings with key '${key}' not found`);
    }

    await this.cacheService.cacheSettings(key, settings);
    this.logger.log(`Settings value updated: ${key} by admin: ${adminId}`);
    return settings;
  }

  async delete(key: string): Promise<void> {
    const result = await this.systemSettingsModel.deleteOne({ key }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Settings with key '${key}' not found`);
    }

    await this.cacheService.deleteCachedSettings(key);
    this.logger.log(`Settings deleted: ${key}`);
  }

  async getValue<T = any>(key: string, defaultValue?: T): Promise<T> {
    try {
      const settings = await this.findByKey(key);
      return settings.value as T;
    } catch (error) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw error;
    }
  }

  async getValueByPath<T = any>(
    key: string,
    path: string,
    defaultValue?: T,
  ): Promise<T> {
    const settings = await this.findByKey(key);
    const pathParts = path.split('.');
    let value: any = settings.value;

    for (const part of pathParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw new NotFoundException(
          `Path '${path}' not found in settings '${key}'`,
        );
      }
    }

    return value as T;
  }

  async initializeDefaults(): Promise<void> {
    return this.defaultsService.initializeDefaults();
  }
}
