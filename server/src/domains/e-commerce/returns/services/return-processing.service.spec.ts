import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReturnProcessingService } from './return-processing.service';
import { ReturnRepository } from '../repositories/return.repository';
import { ReturnStatus } from '../../../../database/schemas/return.schema';

describe('ReturnProcessingService', () => {
  let service: ReturnProcessingService;
  let returnRepository: jest.Mocked<ReturnRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const createMockReturn = (status: ReturnStatus) => ({
    _id: new Types.ObjectId(),
    orderId: new Types.ObjectId(),
    customerId: new Types.ObjectId(),
    status,
    reason: 'Defective product',
    items: [{ productId: new Types.ObjectId(), quantity: 1 }],
    refundAmount: 100,
    refundMethod: 'wallet',
    save: jest.fn().mockResolvedValue(this),
  });

  const mockModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnProcessingService,
        {
          provide: ReturnRepository,
          useValue: {
            getModel: jest.fn().mockReturnValue(mockModel),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReturnProcessingService>(ReturnProcessingService);
    returnRepository = module.get(ReturnRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('markAsPickedUp', () => {
    it('should mark return as picked up', async () => {
      const mockReturn = createMockReturn(ReturnStatus.APPROVED);
      mockModel.findById.mockResolvedValue(mockReturn);

      const result = await service.markAsPickedUp(mockReturn._id.toString());

      expect(result.status).toBe(ReturnStatus.PICKED_UP);
      expect(mockReturn.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'return.picked.up',
        expect.any(Object),
      );
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.markAsPickedUp('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when return not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(
        service.markAsPickedUp(new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when status is not APPROVED', async () => {
      const mockReturn = createMockReturn(ReturnStatus.REQUESTED);
      mockModel.findById.mockResolvedValue(mockReturn);

      await expect(
        service.markAsPickedUp(mockReturn._id.toString()),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('markAsInspected', () => {
    it('should mark return as inspected', async () => {
      const mockReturn = createMockReturn(ReturnStatus.PICKED_UP);
      mockModel.findById.mockResolvedValue(mockReturn);

      const result = await service.markAsInspected(mockReturn._id.toString());

      expect(result.status).toBe(ReturnStatus.INSPECTED);
      expect(mockReturn.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'return.inspected',
        expect.any(Object),
      );
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.markAsInspected('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when return not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(
        service.markAsInspected(new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when status is not PICKED_UP', async () => {
      const mockReturn = createMockReturn(ReturnStatus.APPROVED);
      mockModel.findById.mockResolvedValue(mockReturn);

      await expect(
        service.markAsInspected(mockReturn._id.toString()),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('processRefund', () => {
    it('should process refund', async () => {
      const mockReturn = createMockReturn(ReturnStatus.INSPECTED);
      mockModel.findById.mockResolvedValue(mockReturn);

      const result = await service.processRefund(mockReturn._id.toString());

      expect(result.status).toBe(ReturnStatus.REFUNDED);
      expect(mockReturn.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'return.refunded',
        expect.any(Object),
      );
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.processRefund('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when return not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(
        service.processRefund(new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when status is not INSPECTED', async () => {
      const mockReturn = createMockReturn(ReturnStatus.PICKED_UP);
      mockModel.findById.mockResolvedValue(mockReturn);

      await expect(
        service.processRefund(mockReturn._id.toString()),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
