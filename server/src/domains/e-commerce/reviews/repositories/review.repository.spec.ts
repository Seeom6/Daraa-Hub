import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReviewRepository } from './review.repository';
import { Review } from '../../../../database/schemas/review.schema';
import { MockModelFactory, generateObjectId } from '../../../shared/testing';
import { FakerDataFactory } from '../../../shared/testing/mock-data.factory';

describe('ReviewRepository', () => {
  let repository: ReviewRepository;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = MockModelFactory.create();
    mockModel.aggregate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewRepository,
        {
          provide: getModelToken(Review.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<ReviewRepository>(ReviewRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByProductId', () => {
    it('should find reviews by product id', async () => {
      const productId = generateObjectId();
      const mockReviews = FakerDataFactory.createMany(
        () => FakerDataFactory.createReview({ productId }),
        5,
      );

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReviews),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await repository.findByProductId(productId);

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(5);
    });

    it('should paginate results', async () => {
      const productId = generateObjectId();
      const mockReviews = FakerDataFactory.createMany(
        () => FakerDataFactory.createReview({ productId }),
        2,
      );

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReviews),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const result = await repository.findByProductId(productId, 2, 2);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(10);
    });
  });

  describe('findByCustomerId', () => {
    it('should find reviews by customer id', async () => {
      const customerId = generateObjectId();
      const mockReviews = FakerDataFactory.createMany(
        () => FakerDataFactory.createReview({ customerId }),
        3,
      );

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReviews),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      });

      const result = await repository.findByCustomerId(customerId);

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
    });
  });

  describe('getAverageRating', () => {
    it('should return average rating for product', async () => {
      const productId = generateObjectId();
      mockModel.aggregate.mockResolvedValue([{ _id: null, avgRating: 4.5 }]);

      const result = await repository.getAverageRating(productId);

      expect(result).toBe(4.5);
      expect(mockModel.aggregate).toHaveBeenCalled();
    });

    it('should return 0 if no reviews', async () => {
      const productId = generateObjectId();
      mockModel.aggregate.mockResolvedValue([]);

      const result = await repository.getAverageRating(productId);

      expect(result).toBe(0);
    });
  });
});
