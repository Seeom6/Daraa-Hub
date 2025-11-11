import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NotificationTemplate,
  NotificationTemplateDocument,
} from '../../../../database/schemas/notification-template.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class NotificationTemplateRepository extends BaseRepository<NotificationTemplateDocument> {
  constructor(
    @InjectModel(NotificationTemplate.name)
    private readonly templateModel: Model<NotificationTemplateDocument>,
  ) {
    super(templateModel);
  }

  /**
   * Find template by code
   */
  async findByCode(code: string): Promise<NotificationTemplateDocument | null> {
    return this.findOne({ code, isActive: true });
  }

  /**
   * Find templates by category
   */
  async findByCategory(category: string): Promise<NotificationTemplateDocument[]> {
    return this.find({ category, isActive: true }, { sort: { code: 1 } });
  }

  /**
   * Find all active templates
   */
  async findActiveTemplates(): Promise<NotificationTemplateDocument[]> {
    return this.find({ isActive: true }, { sort: { category: 1, code: 1 } });
  }

  /**
   * Toggle template active status
   */
  async toggleActive(templateId: string): Promise<NotificationTemplateDocument | null> {
    const template = await this.findById(templateId);
    if (!template) return null;

    return this.findByIdAndUpdate(templateId, { isActive: !template.isActive });
  }

  /**
   * Update template content
   */
  async updateContent(
    templateId: string,
    content: any,
  ): Promise<NotificationTemplateDocument | null> {
    return this.findByIdAndUpdate(templateId, { content });
  }

  /**
   * Get templates by channel
   */
  async findByChannel(channel: string): Promise<NotificationTemplateDocument[]> {
    return this.find({
      channels: channel,
      isActive: true,
    });
  }
}

