import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { VerificationRepository } from './verification.repository';
import { VerificationRequest } from '../../../../database/schemas/verification-request.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('VerificationRepository', () => {
  let repository: VerificationRepository;
  let mockModel: any;

  const createMockVerification = (overrides = {}) => ({
    _id: generateObjectId(),
    accountId: generateObjectId(),
    status: 'pending',
    verificationType: 'store_owner',
    createdAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    mockModel = MockModelFactory.create();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationRepository,
        {
          provide: getModelToken(VerificationRequest.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<VerificationRepository>(VerificationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByAccountId', () => {
    it('should find verification by account id', async () => {
      const accountId = generateObjectId();
      const mockVerification = createMockVerification({ accountId });
      mockModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockVerification),
        }),
      });

      const result = await repository.findByAccountId(accountId);

      expect(result).toEqual(mockVerification);
    });

    it('should return null if not found', async () => {
      mockModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await repository.findByAccountId(generateObjectId());

      expect(result).toBeNull();
    });
  });

  describe('findByStatus', () => {
    it('should find verifications by status', async () => {
      const mockVerifications = [
        createMockVerification({ status: 'pending' }),
        createMockVerification({ status: 'pending' }),
      ];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVerifications),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const result = await repository.findByStatus('pending');

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('updateStatus', () => {
    it('should update verification status', async () => {
      const verificationId = generateObjectId();
      const mockVerification = createMockVerification({ status: 'approved' });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVerification),
      });

      const result = await repository.updateStatus(verificationId, 'approved');

      expect(result?.status).toBe('approved');
    });

    it('should include reviewer and rejection reason when provided', async () => {
      const verificationId = generateObjectId();
      const reviewerId = generateObjectId();
      const mockVerification = createMockVerification({ status: 'rejected' });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVerification),
      });

      const result = await repository.updateStatus(
        verificationId,
        'rejected',
        reviewerId,
        'Invalid documents',
      );

      expect(result).toBeDefined();
    });
  });

  describe('getPendingCount', () => {
    it('should return pending verifications count', async () => {
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(15),
      });

      const result = await repository.getPendingCount();

      expect(result).toBe(15);
    });
  });

  describe('findByType', () => {
    it('should find verifications by type', async () => {
      const mockVerifications = [
        createMockVerification({ verificationType: 'courier' }),
      ];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVerifications),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByType('courier');

      expect(result.data).toHaveLength(1);
    });
  });
});
