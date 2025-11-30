import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressRepository } from '../repositories/address.repository';
import { generateObjectId } from '../../testing';

describe('AddressService', () => {
  let service: AddressService;

  const mockAddressRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByCustomerId: jest.fn(),
    findDefaultAddress: jest.fn(),
    countByCustomerId: jest.fn(),
    update: jest.fn(),
    setAsDefault: jest.fn(),
    softDelete: jest.fn(),
    incrementUsage: jest.fn(),
    getModel: jest.fn().mockReturnValue({
      updateMany: jest.fn(),
    }),
  };

  const customerId = generateObjectId();
  const addressId = generateObjectId();

  const mockAddress = {
    _id: addressId,
    customerId,
    label: 'Home',
    city: 'Damascus',
    district: 'Mazzeh',
    street: 'Main Street',
    isDefault: true,
    isActive: true,
    toObject: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        { provide: AddressRepository, useValue: mockAddressRepository },
      ],
    }).compile();

    service = module.get<AddressService>(AddressService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create address', async () => {
      mockAddressRepository.countByCustomerId.mockResolvedValue(0);
      mockAddressRepository.create.mockResolvedValue(mockAddress);

      const result = await service.create(customerId, {
        city: 'Damascus',
        district: 'Mazzeh',
      } as any);

      expect(result).toEqual(mockAddress);
    });

    it('should throw if max addresses reached', async () => {
      mockAddressRepository.countByCustomerId.mockResolvedValue(10);

      await expect(service.create(customerId, {} as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAllByCustomer', () => {
    it('should return customer addresses', async () => {
      mockAddressRepository.findByCustomerId.mockResolvedValue([mockAddress]);

      const result = await service.findAllByCustomer(customerId);

      expect(result).toEqual([mockAddress]);
    });
  });

  describe('findById', () => {
    it('should return address', async () => {
      mockAddressRepository.findById.mockResolvedValue({
        ...mockAddress,
        customerId: { toString: () => customerId },
      });

      const result = await service.findById(addressId, customerId);

      expect(result).toBeDefined();
    });

    it('should throw if not found', async () => {
      mockAddressRepository.findById.mockResolvedValue(null);

      await expect(service.findById(addressId, customerId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if not owner', async () => {
      mockAddressRepository.findById.mockResolvedValue({
        ...mockAddress,
        customerId: { toString: () => 'other-id' },
        isActive: true,
      });

      await expect(service.findById(addressId, customerId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findDefault', () => {
    it('should return default address', async () => {
      mockAddressRepository.findDefaultAddress.mockResolvedValue(mockAddress);

      const result = await service.findDefault(customerId);

      expect(result).toEqual(mockAddress);
    });
  });

  describe('setAsDefault', () => {
    it('should set address as default', async () => {
      mockAddressRepository.findById.mockResolvedValue({
        ...mockAddress,
        customerId: { toString: () => customerId },
      });
      mockAddressRepository.setAsDefault.mockResolvedValue({
        ...mockAddress,
        isDefault: true,
      });

      const result = await service.setAsDefault(addressId, customerId);

      expect(result.isDefault).toBe(true);
    });
  });

  describe('delete', () => {
    it('should soft delete address', async () => {
      mockAddressRepository.findById.mockResolvedValue({
        ...mockAddress,
        customerId: { toString: () => customerId },
        isDefault: false,
      });
      mockAddressRepository.softDelete.mockResolvedValue(undefined);

      await service.delete(addressId, customerId);

      expect(mockAddressRepository.softDelete).toHaveBeenCalledWith(addressId);
    });
  });

  describe('markAsUsed', () => {
    it('should increment usage', async () => {
      mockAddressRepository.incrementUsage.mockResolvedValue(undefined);

      await service.markAsUsed(addressId);

      expect(mockAddressRepository.incrementUsage).toHaveBeenCalledWith(
        addressId,
      );
    });
  });

  describe('update', () => {
    it('should update address', async () => {
      mockAddressRepository.findById.mockResolvedValue({
        ...mockAddress,
        customerId: { toString: () => customerId },
        toObject: () => mockAddress,
      });
      mockAddressRepository.update.mockResolvedValue({
        ...mockAddress,
        street: 'New Street',
      });

      const result = await service.update(addressId, customerId, {
        street: 'New Street',
      });

      expect(result.street).toBe('New Street');
    });

    it('should set as default when isDefault is true', async () => {
      mockAddressRepository.findById.mockResolvedValue({
        ...mockAddress,
        customerId: { toString: () => customerId },
      });
      mockAddressRepository.setAsDefault.mockResolvedValue({
        ...mockAddress,
        isDefault: true,
      });

      const result = await service.update(addressId, customerId, {
        isDefault: true,
      });

      expect(result.isDefault).toBe(true);
    });

    it('should update location when coordinates provided', async () => {
      mockAddressRepository.findById.mockResolvedValue({
        ...mockAddress,
        customerId: { toString: () => customerId },
        toObject: () => mockAddress,
      });
      mockAddressRepository.update.mockResolvedValue({
        ...mockAddress,
        location: { type: 'Point', coordinates: [36.3, 33.5] },
      });

      const result = await service.update(addressId, customerId, {
        latitude: 33.5,
        longitude: 36.3,
      });

      expect(mockAddressRepository.update).toHaveBeenCalled();
    });

    it('should throw if update fails', async () => {
      mockAddressRepository.findById.mockResolvedValue({
        ...mockAddress,
        customerId: { toString: () => customerId },
        toObject: () => mockAddress,
      });
      mockAddressRepository.update.mockResolvedValue(null);

      await expect(
        service.update(addressId, customerId, { street: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create with location', () => {
    it('should create address with coordinates', async () => {
      mockAddressRepository.countByCustomerId.mockResolvedValue(0);
      mockAddressRepository.create.mockResolvedValue({
        ...mockAddress,
        location: { type: 'Point', coordinates: [36.3, 33.5] },
      });

      const result = await service.create(customerId, {
        city: 'Damascus',
        district: 'Mazzeh',
        latitude: 33.5,
        longitude: 36.3,
      } as any);

      expect(mockAddressRepository.create).toHaveBeenCalled();
    });

    it('should unset other defaults when setting new default', async () => {
      mockAddressRepository.countByCustomerId.mockResolvedValue(2);
      mockAddressRepository
        .getModel()
        .updateMany.mockResolvedValue({ modifiedCount: 2 });
      mockAddressRepository.create.mockResolvedValue(mockAddress);

      await service.create(customerId, {
        city: 'Damascus',
        isDefault: true,
      } as any);

      expect(mockAddressRepository.getModel().updateMany).toHaveBeenCalled();
    });
  });

  describe('delete with default reassignment', () => {
    it('should reassign default when deleting default address', async () => {
      const otherAddress = {
        ...mockAddress,
        _id: 'other-id',
        isDefault: false,
      };
      mockAddressRepository.findById.mockResolvedValue({
        ...mockAddress,
        customerId: { toString: () => customerId },
        isDefault: true,
      });
      mockAddressRepository.softDelete.mockResolvedValue(undefined);
      mockAddressRepository.findByCustomerId.mockResolvedValue([otherAddress]);
      mockAddressRepository.setAsDefault.mockResolvedValue(otherAddress);

      await service.delete(addressId, customerId);

      expect(mockAddressRepository.setAsDefault).toHaveBeenCalled();
    });
  });

  describe('toDeliveryAddress', () => {
    it('should convert address to delivery format', () => {
      const address = {
        fullName: 'John Doe',
        phoneNumber: '+963991234567',
        fullAddress: 'Main Street, Mazzeh, Damascus',
        city: 'Damascus',
        district: 'Mazzeh',
        location: { type: 'Point', coordinates: [36.3, 33.5] },
        deliveryInstructions: 'Ring twice',
      } as any;

      const result = service.toDeliveryAddress(address);

      expect(result.fullName).toBe('John Doe');
      expect(result.notes).toBe('Ring twice');
    });
  });

  describe('setAsDefault error handling', () => {
    it('should throw if setAsDefault fails', async () => {
      mockAddressRepository.findById.mockResolvedValue({
        ...mockAddress,
        customerId: { toString: () => customerId },
      });
      mockAddressRepository.setAsDefault.mockResolvedValue(null);

      await expect(service.setAsDefault(addressId, customerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById with inactive address', () => {
    it('should throw if address is inactive', async () => {
      mockAddressRepository.findById.mockResolvedValue({
        ...mockAddress,
        isActive: false,
      });

      await expect(service.findById(addressId, customerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
