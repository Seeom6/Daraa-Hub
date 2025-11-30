import { Test, TestingModule } from '@nestjs/testing';
import { AddressController } from './address.controller';
import { AddressService } from '../services/address.service';
import { JwtAuthGuard, RolesGuard } from '../../../../common/guards';
import { generateObjectId } from '../../testing';

describe('AddressController', () => {
  let controller: AddressController;

  const mockAddressService = {
    create: jest.fn(),
    findAllByCustomer: jest.fn(),
    findById: jest.fn(),
    findDefault: jest.fn(),
    update: jest.fn(),
    setAsDefault: jest.fn(),
    delete: jest.fn(),
  };

  const profileId = generateObjectId();
  const addressId = generateObjectId();

  const mockUser = {
    sub: generateObjectId(),
    userId: generateObjectId(),
    phone: '+963991234567',
    role: 'customer',
    profileId,
  };

  const mockAddress = {
    _id: addressId,
    customerId: profileId,
    label: 'Home',
    city: 'Damascus',
    isDefault: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [{ provide: AddressService, useValue: mockAddressService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AddressController>(AddressController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create address', async () => {
      mockAddressService.create.mockResolvedValue(mockAddress);

      const result = await controller.create(mockUser, {
        city: 'Damascus',
      } as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAddress);
    });
  });

  describe('findAll', () => {
    it('should return all addresses', async () => {
      mockAddressService.findAllByCustomer.mockResolvedValue([mockAddress]);

      const result = await controller.findAll(mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockAddress]);
    });
  });

  describe('findDefault', () => {
    it('should return default address', async () => {
      mockAddressService.findDefault.mockResolvedValue(mockAddress);

      const result = await controller.findDefault(mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAddress);
    });
  });

  describe('findOne', () => {
    it('should return address by id', async () => {
      mockAddressService.findById.mockResolvedValue(mockAddress);

      const result = await controller.findOne(addressId, mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAddress);
    });
  });

  describe('update', () => {
    it('should update address', async () => {
      mockAddressService.update.mockResolvedValue(mockAddress);

      const result = await controller.update(addressId, mockUser, {
        city: 'Aleppo',
      } as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAddress);
    });
  });

  describe('setDefault', () => {
    it('should set address as default', async () => {
      mockAddressService.setAsDefault.mockResolvedValue(mockAddress);

      const result = await controller.setDefault(addressId, mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAddress);
    });
  });

  describe('delete', () => {
    it('should delete address', async () => {
      mockAddressService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(addressId, mockUser);

      expect(result.success).toBe(true);
    });
  });
});
