import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationTemplateRepository } from '../repositories/notification-template.repository';
import { generateObjectId } from '../../testing';

describe('NotificationTemplateService', () => {
  let service: NotificationTemplateService;
  let mockRepository: any;

  const mockTemplate = {
    _id: generateObjectId(),
    code: 'WELCOME',
    category: 'account',
    isActive: true,
    inApp: {
      titleAr: 'مرحباً {{name}}',
      messageAr: 'أهلاً بك في منصتنا',
      titleEn: 'Welcome {{name}}',
      messageEn: 'Welcome to our platform',
    },
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn().mockResolvedValue(mockTemplate),
      findByCode: jest.fn().mockResolvedValue(mockTemplate),
      find: jest.fn().mockResolvedValue([mockTemplate]),
      findActiveTemplates: jest.fn().mockResolvedValue([mockTemplate]),
      findByCategory: jest.fn().mockResolvedValue([mockTemplate]),
      findByIdAndUpdate: jest.fn().mockResolvedValue(mockTemplate),
      toggleActive: jest.fn().mockResolvedValue(mockTemplate),
      delete: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationTemplateService,
        { provide: NotificationTemplateRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<NotificationTemplateService>(
      NotificationTemplateService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTemplate', () => {
    it('should create a template', async () => {
      await service.createTemplate({ code: 'NEW_TEMPLATE' });

      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('findByCode', () => {
    it('should return template by code', async () => {
      const result = await service.findByCode('WELCOME');

      expect(result).toEqual(mockTemplate);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findByCode.mockResolvedValue(null);

      await expect(service.findByCode('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCodeOrNull', () => {
    it('should return null if not found', async () => {
      mockRepository.findByCode.mockResolvedValue(null);

      const result = await service.findByCodeOrNull('INVALID');

      expect(result).toBeNull();
    });
  });

  describe('getAllTemplates', () => {
    it('should return all templates', async () => {
      const result = await service.getAllTemplates();

      expect(result).toEqual([mockTemplate]);
    });
  });

  describe('getActiveTemplates', () => {
    it('should return active templates', async () => {
      const result = await service.getActiveTemplates();

      expect(result).toEqual([mockTemplate]);
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates by category', async () => {
      const result = await service.getTemplatesByCategory('account');

      expect(result).toEqual([mockTemplate]);
    });
  });

  describe('updateTemplate', () => {
    it('should update template', async () => {
      const result = await service.updateTemplate(mockTemplate._id, {
        isActive: false,
      });

      expect(result).toEqual(mockTemplate);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.updateTemplate('invalid', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleActive', () => {
    it('should toggle active status', async () => {
      const result = await service.toggleActive(mockTemplate._id);

      expect(result).toEqual(mockTemplate);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.toggleActive.mockResolvedValue(null);

      await expect(service.toggleActive('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template', async () => {
      await service.deleteTemplate(mockTemplate._id);

      expect(mockRepository.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.delete.mockResolvedValue(null);

      await expect(service.deleteTemplate('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('replaceVariables', () => {
    it('should replace variables in text', () => {
      const result = service.replaceVariables('Hello {{name}}!', {
        name: 'John',
      });

      expect(result).toBe('Hello John!');
    });

    it('should return original text if no variables', () => {
      const result = service.replaceVariables('Hello!', undefined);

      expect(result).toBe('Hello!');
    });
  });

  describe('processTemplate', () => {
    it('should process Arabic template', () => {
      const result = service.processTemplate(
        mockTemplate as any,
        { name: 'أحمد' },
        'ar',
      );

      expect(result.title).toBe('مرحباً أحمد');
    });

    it('should process English template', () => {
      const result = service.processTemplate(
        mockTemplate as any,
        { name: 'John' },
        'en',
      );

      expect(result.title).toBe('Welcome John');
    });
  });
});
