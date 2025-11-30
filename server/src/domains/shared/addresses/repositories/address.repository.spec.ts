import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AddressRepository } from './address.repository';
import { Address } from '../../../../database/schemas/address.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('AddressRepository', () => {
  let repository: AddressRepository;
  let mockModel: any;

  const addressId = generateObjectId();
  const customerId = generateObjectId();

  const mockAddress = {
    _id: addressId,
    customerId,
    label: 'Home',
    street: '123 Main St',
    city: 'Damascus',
    isDefault: true,
    isActive: true,
    usageCount: 5,
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockAddress]);
    mockModel.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockAddress) });
    mockModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressRepository,
        { provide: getModelToken(Address.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<AddressRepository>(AddressRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByCustomerId', () => {
    it('should find addresses by customer ID', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAddress]),
      });

      const result = await repository.findByCustomerId(customerId);

      expect(result).toEqual([mockAddress]);
    });
  });

  describe('findDefaultAddress', () => {
    it('should find default address', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAddress),
      });

      const result = await repository.findDefaultAddress(customerId);

      expect(result).toEqual(mockAddress);
    });
  });

  describe('setAsDefault', () => {
    it('should set address as default', async () => {
      const result = await repository.setAsDefault(customerId, addressId);

      expect(mockModel.updateMany).toHaveBeenCalled();
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage count', async () => {
      const result = await repository.incrementUsage(addressId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('should soft delete address', async () => {
      const result = await repository.softDelete(addressId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('countByCustomerId', () => {
    it('should count addresses by customer ID', async () => {
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      });

      const result = await repository.countByCustomerId(customerId);

      expect(result).toBe(3);
    });

    it('should return 0 when no addresses', async () => {
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await repository.countByCustomerId(generateObjectId());

      expect(result).toBe(0);
    });
  });

  describe('isOwnedByCustomer', () => {
    it('should return true if address is owned by customer', async () => {
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.isOwnedByCustomer(addressId, customerId);

      expect(result).toBe(true);
    });

    it('should return false if address is not owned by customer', async () => {
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await repository.isOwnedByCustomer(
        addressId,
        generateObjectId(),
      );

      expect(result).toBe(false);
    });
  });

  describe('findNearLocation', () => {
    it('should find addresses near location with default distance', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockAddress]),
      });

      const result = await repository.findNearLocation(36.3, 33.5);

      expect(result).toEqual([mockAddress]);
    });

    it('should find addresses near location with custom distance', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockAddress]),
      });

      const result = await repository.findNearLocation(36.3, 33.5, 10000);

      expect(result).toEqual([mockAddress]);
    });

    it('should return empty array when no addresses found', async () => {
      mockModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      const result = await repository.findNearLocation(0, 0);

      expect(result).toEqual([]);
    });
  });

  describe('findDefaultAddress when not found', () => {
    it('should return null when no default address', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findDefaultAddress(generateObjectId());

      expect(result).toBeNull();
    });
  });

  describe('findByCustomerId when empty', () => {
    it('should return empty array when no addresses', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.findByCustomerId(generateObjectId());

      expect(result).toEqual([]);
    });
  });
});
