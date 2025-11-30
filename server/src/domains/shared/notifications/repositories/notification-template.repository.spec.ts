import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationTemplateRepository } from './notification-template.repository';
import { NotificationTemplate } from '../../../../database/schemas/notification-template.schema';

describe('NotificationTemplateRepository', () => {
  let repository: NotificationTemplateRepository;
  let mockModel: any;

  const mockTemplate = {
    _id: '507f1f77bcf86cd799439011',
    code: 'WELCOME_MESSAGE',
    category: 'user',
    channels: ['push', 'sms'],
    isActive: true,
    content: {
      title: { ar: 'مرحبا', en: 'Welcome' },
      body: { ar: 'مرحبا بك', en: 'Welcome to our app' },
    },
  };

  beforeEach(async () => {
    mockModel = {
      findOne: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationTemplateRepository,
        {
          provide: getModelToken(NotificationTemplate.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<NotificationTemplateRepository>(
      NotificationTemplateRepository,
    );

    // Mock inherited methods from BaseRepository
    jest.spyOn(repository, 'findOne').mockImplementation(async (filter) => {
      if (filter.code === 'WELCOME_MESSAGE') return mockTemplate as any;
      return null;
    });
    jest
      .spyOn(repository, 'find')
      .mockImplementation(async () => [mockTemplate] as any);
    jest.spyOn(repository, 'findById').mockImplementation(async (id) => {
      if (id === '507f1f77bcf86cd799439011') return mockTemplate as any;
      return null;
    });
    jest
      .spyOn(repository, 'findByIdAndUpdate')
      .mockImplementation(async (id, update) => {
        if (id === '507f1f77bcf86cd799439011') {
          return { ...mockTemplate, ...update } as any;
        }
        return null;
      });
  });

  describe('findByCode', () => {
    it('should find template by code', async () => {
      const result = await repository.findByCode('WELCOME_MESSAGE');

      expect(repository.findOne).toHaveBeenCalledWith({
        code: 'WELCOME_MESSAGE',
        isActive: true,
      });
      expect(result).toEqual(mockTemplate);
    });

    it('should return null if not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await repository.findByCode('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('findByCategory', () => {
    it('should find templates by category', async () => {
      const result = await repository.findByCategory('user');

      expect(repository.find).toHaveBeenCalledWith(
        { category: 'user', isActive: true },
        { sort: { code: 1 } },
      );
      expect(result).toEqual([mockTemplate]);
    });
  });

  describe('findActiveTemplates', () => {
    it('should find all active templates', async () => {
      const result = await repository.findActiveTemplates();

      expect(repository.find).toHaveBeenCalledWith(
        { isActive: true },
        { sort: { category: 1, code: 1 } },
      );
      expect(result).toEqual([mockTemplate]);
    });
  });

  describe('toggleActive', () => {
    it('should toggle template active status', async () => {
      const result = await repository.toggleActive('507f1f77bcf86cd799439011');

      expect(repository.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(repository.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { isActive: false },
      );
      expect(result?.isActive).toBe(false);
    });

    it('should return null if template not found', async () => {
      const result = await repository.toggleActive('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateContent', () => {
    it('should update template content', async () => {
      const newContent = { title: { ar: 'جديد', en: 'New' } };

      const result = await repository.updateContent(
        '507f1f77bcf86cd799439011',
        newContent,
      );

      expect(repository.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { content: newContent },
      );
      expect(result).toBeDefined();
    });
  });

  describe('findByChannel', () => {
    it('should find templates by channel', async () => {
      const result = await repository.findByChannel('push');

      expect(repository.find).toHaveBeenCalledWith({
        channels: 'push',
        isActive: true,
      });
      expect(result).toEqual([mockTemplate]);
    });
  });
});
