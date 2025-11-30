import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CommissionRepository } from './commission.repository';
import { Commission } from '../../../../database/schemas/commission.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('CommissionRepository', () => {
  let repository: CommissionRepository;
  let mockModel: any;

  const commissionId = generateObjectId();
  const orderId = generateObjectId();
  const storeAccountId = generateObjectId();
  const courierAccountId = generateObjectId();

  const mockCommission = {
    _id: commissionId,
    orderId,
    storeAccountId,
    courierAccountId,
    orderAmount: 1000,
    commissionAmount: 100,
    status: 'pending',
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockCommission]);
    mockModel.aggregate = jest
      .fn()
      .mockResolvedValue([{ totalOrders: 10, totalCommission: 1000 }]);
    mockModel.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockCommission) });
    mockModel.create = jest.fn().mockResolvedValue([mockCommission]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionRepository,
        { provide: getModelToken(Commission.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<CommissionRepository>(CommissionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWithSession', () => {
    it('should create commission with session', async () => {
      const result = await repository.createWithSession(mockCommission);

      expect(mockModel.create).toHaveBeenCalled();
    });
  });

  describe('findByOrderId', () => {
    it('should find commission by order ID', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCommission),
      });

      const result = await repository.findByOrderId(orderId);

      expect(result).toEqual(mockCommission);
    });
  });

  describe('findByStoreAccountId', () => {
    it('should find commissions by store account ID', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCommission]),
      });

      const result = await repository.findByStoreAccountId(storeAccountId);

      expect(result).toEqual([mockCommission]);
    });

    it('should find commissions by store account ID with status filter', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCommission]),
      });

      const result = await repository.findByStoreAccountId(
        storeAccountId,
        'pending' as any,
        10,
        5,
      );

      expect(result).toEqual([mockCommission]);
    });
  });

  describe('findByCourierAccountId', () => {
    it('should find commissions by courier account ID', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCommission]),
      });

      const result = await repository.findByCourierAccountId(courierAccountId);

      expect(result).toEqual([mockCommission]);
    });

    it('should find commissions by courier account ID with status filter', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCommission]),
      });

      const result = await repository.findByCourierAccountId(
        courierAccountId,
        'collected' as any,
        20,
        10,
      );

      expect(result).toEqual([mockCommission]);
    });
  });

  describe('findPendingCommissions', () => {
    it('should find pending commissions', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCommission]),
      });

      const result = await repository.findPendingCommissions();

      expect(result).toEqual([mockCommission]);
    });

    it('should find pending commissions with type filter', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCommission]),
      });

      const result = await repository.findPendingCommissions(
        'store' as any,
        50,
      );

      expect(result).toEqual([mockCommission]);
    });
  });

  describe('updateStatus', () => {
    it('should update commission status to collected', async () => {
      const result = await repository.updateStatus(
        commissionId,
        'collected' as any,
      );

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should update commission status to paid_out', async () => {
      const result = await repository.updateStatus(
        commissionId,
        'paid_out' as any,
      );

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should update commission status to pending', async () => {
      const result = await repository.updateStatus(
        commissionId,
        'pending' as any,
      );

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should update commission status with session', async () => {
      const mockSession = {} as any;
      const result = await repository.updateStatus(
        commissionId,
        'collected' as any,
        mockSession,
      );

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('getStoreSummary', () => {
    it('should return store summary', async () => {
      const result = await repository.getStoreSummary(storeAccountId);

      expect(mockModel.aggregate).toHaveBeenCalled();
    });

    it('should return store summary with date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await repository.getStoreSummary(
        storeAccountId,
        startDate,
        endDate,
      );

      expect(mockModel.aggregate).toHaveBeenCalled();
    });

    it('should return store summary with only startDate', async () => {
      const startDate = new Date('2024-01-01');
      const result = await repository.getStoreSummary(
        storeAccountId,
        startDate,
      );

      expect(mockModel.aggregate).toHaveBeenCalled();
    });

    it('should return store summary with only endDate', async () => {
      const endDate = new Date('2024-12-31');
      const result = await repository.getStoreSummary(
        storeAccountId,
        undefined,
        endDate,
      );

      expect(mockModel.aggregate).toHaveBeenCalled();
    });

    it('should return default values when no results', async () => {
      mockModel.aggregate.mockResolvedValue([]);
      const result = await repository.getStoreSummary(storeAccountId);

      expect(result).toEqual({
        totalOrders: 0,
        totalOrderAmount: 0,
        totalCommission: 0,
        totalNetEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0,
      });
    });
  });

  describe('getPlatformSummary', () => {
    it('should return platform summary', async () => {
      const result = await repository.getPlatformSummary();

      expect(mockModel.aggregate).toHaveBeenCalled();
    });

    it('should return platform summary with date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await repository.getPlatformSummary(startDate, endDate);

      expect(mockModel.aggregate).toHaveBeenCalled();
    });

    it('should return platform summary with only startDate', async () => {
      const startDate = new Date('2024-01-01');
      const result = await repository.getPlatformSummary(startDate);

      expect(mockModel.aggregate).toHaveBeenCalled();
    });

    it('should return platform summary with only endDate', async () => {
      const endDate = new Date('2024-12-31');
      const result = await repository.getPlatformSummary(undefined, endDate);

      expect(mockModel.aggregate).toHaveBeenCalled();
    });

    it('should return default values when no results', async () => {
      mockModel.aggregate.mockResolvedValue([]);
      const result = await repository.getPlatformSummary();

      expect(result).toEqual({
        totalOrders: 0,
        totalOrderAmount: 0,
        totalPlatformEarnings: 0,
        pendingCollection: 0,
        collected: 0,
      });
    });
  });

  describe('findByOrderId when not found', () => {
    it('should return null when order not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByOrderId(generateObjectId());

      expect(result).toBeNull();
    });
  });

  describe('createWithSession with session', () => {
    it('should create commission with session', async () => {
      const mockSession = {} as any;
      const result = await repository.createWithSession(
        mockCommission,
        mockSession,
      );

      expect(mockModel.create).toHaveBeenCalledWith([mockCommission], {
        session: mockSession,
      });
    });
  });
});
