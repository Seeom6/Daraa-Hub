import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { NotificationTemplateDocument } from '../../../../database/schemas/notification-template.schema';
import { NotificationTemplateRepository } from '../repositories/notification-template.repository';

/**
 * Notification Template Service
 * Handles template CRUD operations and variable replacement
 */
@Injectable()
export class NotificationTemplateService {
  private readonly logger = new Logger(NotificationTemplateService.name);

  constructor(
    private readonly templateRepository: NotificationTemplateRepository,
  ) {}

  /**
   * Create a new template
   */
  async createTemplate(
    template: Partial<NotificationTemplateDocument>,
  ): Promise<NotificationTemplateDocument> {
    const created = await this.templateRepository.create(template as any);
    this.logger.log(`Template created: ${template.code}`);
    return created.save();
  }

  /**
   * Find template by code
   */
  async findByCode(code: string): Promise<NotificationTemplateDocument> {
    const template = await this.templateRepository.findByCode(code);
    if (!template) {
      throw new NotFoundException(`Template '${code}' not found`);
    }
    return template;
  }

  /**
   * Find template by code (returns null if not found)
   */
  async findByCodeOrNull(
    code: string,
  ): Promise<NotificationTemplateDocument | null> {
    return this.templateRepository.findByCode(code);
  }

  /**
   * Get all templates
   */
  async getAllTemplates(): Promise<NotificationTemplateDocument[]> {
    return this.templateRepository.find({});
  }

  /**
   * Get all active templates
   */
  async getActiveTemplates(): Promise<NotificationTemplateDocument[]> {
    return this.templateRepository.findActiveTemplates();
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(
    category: string,
  ): Promise<NotificationTemplateDocument[]> {
    return this.templateRepository.findByCategory(category);
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    updateData: Partial<NotificationTemplateDocument>,
  ): Promise<NotificationTemplateDocument> {
    const updated = await this.templateRepository.findByIdAndUpdate(
      templateId,
      updateData,
    );
    if (!updated) {
      throw new NotFoundException('Template not found');
    }
    this.logger.log(`Template updated: ${templateId}`);
    return updated;
  }

  /**
   * Toggle template active status
   */
  async toggleActive(
    templateId: string,
  ): Promise<NotificationTemplateDocument> {
    const template = await this.templateRepository.toggleActive(templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    this.logger.log(
      `Template ${templateId} ${template.isActive ? 'activated' : 'deactivated'}`,
    );
    return template;
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    const deleted = await this.templateRepository.delete(templateId);
    if (!deleted) {
      throw new NotFoundException('Template not found');
    }
    this.logger.log(`Template deleted: ${templateId}`);
  }

  // ============================================
  // Variable Replacement Utilities
  // ============================================

  /**
   * Replace variables in template text
   * Supports {{variableName}} syntax
   */
  replaceVariables(text: string, variables?: Record<string, any>): string {
    if (!variables || !text) return text;

    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value ?? ''));
    }
    return result;
  }

  /**
   * Process template with variables (Arabic version)
   */
  processTemplateArabic(
    template: NotificationTemplateDocument,
    variables?: Record<string, any>,
  ): { title: string; message: string } {
    return {
      title: this.replaceVariables(template.inApp?.titleAr || '', variables),
      message: this.replaceVariables(
        template.inApp?.messageAr || '',
        variables,
      ),
    };
  }

  /**
   * Process template with variables (English version)
   */
  processTemplateEnglish(
    template: NotificationTemplateDocument,
    variables?: Record<string, any>,
  ): { title: string; message: string } {
    return {
      title: this.replaceVariables(template.inApp?.titleEn || '', variables),
      message: this.replaceVariables(
        template.inApp?.messageEn || '',
        variables,
      ),
    };
  }

  /**
   * Process template for specific language
   */
  processTemplate(
    template: NotificationTemplateDocument,
    variables?: Record<string, any>,
    language: 'ar' | 'en' = 'ar',
  ): { title: string; message: string } {
    return language === 'ar'
      ? this.processTemplateArabic(template, variables)
      : this.processTemplateEnglish(template, variables);
  }
}
