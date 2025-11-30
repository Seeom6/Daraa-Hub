import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DisputeResolutionService } from './dispute-resolution.service';
import { DisputeRepository } from '../repositories/dispute.repository';
import { DisputeStatus } from '../../../../database/schemas/dispute.schema';

describe('DisputeResolutionService', () => {
  let service: DisputeResolutionService;
  let disputeRepository: jest.Mocked<DisputeRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockDisputeId = new Types.ObjectId();
  const mockAdminId = new Types.ObjectId().toString();
  const mockOrderId = new Types.ObjectId();

  const createMockDispute = (status: DisputeStatus = DisputeStatus.OPEN) => ({
    _id: mockDisputeId,
    orderId: mockOrderId,
    status,
    resolution: null,
    resolvedAt: null,
    save: jest.fn().mockResolvedValue(true),
  });

  beforeEach(async () => {
    const mockModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeResolutionService,
        {
          provide: DisputeRepository,
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

    service = module.get<DisputeResolutionService>(DisputeResolutionService);
    disputeRepository = module.get(DisputeRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('resolve', () => {
    const resolveDto = {
      action: 'refund',
      amount: 50,
      notes: 'Refund issued',
    };

    it('should resolve dispute successfully', async () => {
      const mockDispute = createMockDispute();
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockDispute,
      );

      const result = await service.resolve(
        mockDisputeId.toString(),
        resolveDto,
        mockAdminId,
      );

      expect(result.status).toBe(DisputeStatus.RESOLVED);
      expect(result.resolution).toEqual({
        action: 'refund',
        amount: 50,
        notes: 'Refund issued',
      });
      expect(mockDispute.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'dispute.resolved',
        expect.any(Object),
      );
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(
        service.resolve('invalid-id', resolveDto, mockAdminId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when dispute not found', async () => {
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.resolve(mockDisputeId.toString(), resolveDto, mockAdminId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when dispute is already resolved', async () => {
      const mockDispute = createMockDispute(DisputeStatus.RESOLVED);
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockDispute,
      );

      await expect(
        service.resolve(mockDisputeId.toString(), resolveDto, mockAdminId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when dispute is already closed', async () => {
      const mockDispute = createMockDispute(DisputeStatus.CLOSED);
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockDispute,
      );

      await expect(
        service.resolve(mockDisputeId.toString(), resolveDto, mockAdminId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use default values for optional fields', async () => {
      const mockDispute = createMockDispute();
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockDispute,
      );

      await service.resolve(
        mockDisputeId.toString(),
        { action: 'warning' },
        mockAdminId,
      );

      expect(mockDispute.resolution).toEqual({
        action: 'warning',
        amount: 0,
        notes: '',
      });
    });
  });

  describe('close', () => {
    it('should close dispute successfully', async () => {
      const mockDispute = createMockDispute();
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockDispute,
      );

      const result = await service.close(mockDisputeId.toString(), mockAdminId);

      expect(result.status).toBe(DisputeStatus.CLOSED);
      expect(mockDispute.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'dispute.closed',
        expect.any(Object),
      );
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.close('invalid-id', mockAdminId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when dispute not found', async () => {
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.close(mockDisputeId.toString(), mockAdminId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when dispute is already closed', async () => {
      const mockDispute = createMockDispute(DisputeStatus.CLOSED);
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockDispute,
      );

      await expect(
        service.close(mockDisputeId.toString(), mockAdminId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
