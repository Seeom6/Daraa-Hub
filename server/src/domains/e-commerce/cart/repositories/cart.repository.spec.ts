import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CartRepository } from './cart.repository';
import { Cart } from '../../../../database/schemas/cart.schema';
import { MockModelFactory, generateObjectId } from '../../../shared/testing';

describe('CartRepository', () => {
  let repository: CartRepository;
  let mockModel: any;

  const createMockCart = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    customerId: new Types.ObjectId(),
    items: [],
    save: jest.fn().mockResolvedValue({}),
    ...overrides,
  });

  beforeEach(async () => {
    mockModel = MockModelFactory.create();
    mockModel.findByIdAndDelete = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartRepository,
        {
          provide: getModelToken(Cart.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<CartRepository>(CartRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByCustomerId', () => {
    it('should find cart by customer id with populated items', async () => {
      const customerId = generateObjectId();
      const mockCart = createMockCart({
        customerId: new Types.ObjectId(customerId),
      });
      mockModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockCart),
          }),
        }),
      });

      const result = await repository.findByCustomerId(customerId);

      expect(result).toBeDefined();
    });

    it('should return null if cart not found', async () => {
      mockModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      const result = await repository.findByCustomerId(generateObjectId());

      expect(result).toBeNull();
    });
  });

  describe('addItem', () => {
    it('should create new cart if not exists', async () => {
      const customerId = generateObjectId();
      const productId = generateObjectId();
      const newCart = createMockCart();

      mockModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });
      // BaseRepository.create uses model.create internally
      mockModel.create.mockResolvedValue(newCart);

      const result = await repository.addItem(customerId, productId, 2);

      // Verify that a cart was created (either via model.create or constructor)
      expect(result).toBeDefined();
    });

    it('should add item to existing cart', async () => {
      const customerId = generateObjectId();
      const productId = generateObjectId();
      const mockCart = createMockCart({
        items: [],
        save: jest
          .fn()
          .mockResolvedValue({ items: [{ productId, quantity: 2 }] }),
      });

      mockModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockCart),
          }),
        }),
      });

      const result = await repository.addItem(customerId, productId, 2);

      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should update quantity if item already exists', async () => {
      const customerId = generateObjectId();
      const productId = generateObjectId();
      const mockCart = createMockCart({
        items: [{ productId: new Types.ObjectId(productId), quantity: 1 }],
        save: jest.fn().mockResolvedValue({}),
      });

      mockModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockCart),
          }),
        }),
      });

      await repository.addItem(customerId, productId, 2);

      expect(mockCart.items[0].quantity).toBe(3);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const customerId = generateObjectId();
      const mockCart = createMockCart({
        items: [{ productId: new Types.ObjectId(), quantity: 1 }],
        save: jest.fn().mockResolvedValue({ items: [] }),
      });

      mockModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockCart),
          }),
        }),
      });

      await repository.clearCart(customerId);

      expect(mockCart.items).toHaveLength(0);
    });
  });

  describe('getItemCount', () => {
    it('should return total item count', async () => {
      const customerId = generateObjectId();
      const mockCart = createMockCart({
        items: [
          { productId: new Types.ObjectId(), quantity: 2 },
          { productId: new Types.ObjectId(), quantity: 3 },
        ],
      });

      mockModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockCart),
          }),
        }),
      });

      const result = await repository.getItemCount(customerId);

      expect(result).toBe(5);
    });

    it('should return 0 if cart not found', async () => {
      mockModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      const result = await repository.getItemCount(generateObjectId());

      expect(result).toBe(0);
    });
  });
});
