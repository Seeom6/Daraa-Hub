import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReturnRequestService } from './return-request.service';
import { ReturnRepository } from '../repositories/return.repository';
import { ReturnStatus } from '../../../../database/schemas/return.schema';
import { Types } from 'mongoose';

describe('ReturnRequestService', () => {
  let service: ReturnRequestService;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;

  const customerId = new Types.ObjectId().toString();
  const orderId = new Types.ObjectId().toString();
  const productId = new Types.ObjectId().toString();
  const returnId = new Types.ObjectId().toString();
  const storeOwnerId = new Types.ObjectId().toString();
  const adminId = new Types.ObjectId().toString();

  const mockReturnRequest = {
    _id: returnId,
    customerId: new Types.ObjectId(customerId),
    orderId: new Types.ObjectId(orderId),
    items: [{ productId: new Types.ObjectId(productId), quantity: 1 }],
    status: ReturnStatus.REQUESTED,
    save: jest.fn(),
  };

  const mockReturnModel = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ ...data, _id: returnId }),
  }));

  const mockRepository = {
    getModel: jest.fn().mockReturnValue(
      Object.assign(mockReturnModel, {
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
      }),
    ),
  };

  beforeEach(async () => {
    mockEventEmitter = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnRequestService,
        { provide: ReturnRepository, useValue: mockRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<ReturnRequestService>(ReturnRequestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a return request', async () => {
      const createDto = {
        orderId,
        reason: 'Defective product',
        items: [{ productId, quantity: 1, reason: 'Broken' }],
      };

      await service.create(createDto, customerId);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'return.created',
        expect.any(Object),
      );
    });
  });

  describe('update', () => {
    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.update('invalid-id', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when return not found', async () => {
      mockRepository.getModel().findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(returnId, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update return request', async () => {
      const updatedReturn = {
        ...mockReturnRequest,
        status: ReturnStatus.APPROVED,
      };
      mockRepository.getModel().findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedReturn),
      });

      const result = await service.update(returnId, {
        status: ReturnStatus.APPROVED,
      });

      expect(result.status).toBe(ReturnStatus.APPROVED);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'return.updated',
        expect.any(Object),
      );
    });
  });

  describe('storeRespond', () => {
    it('should throw BadRequestException for invalid ID', async () => {
      await expect(
        service.storeRespond('invalid-id', { approved: true }, storeOwnerId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when return not found', async () => {
      mockRepository.getModel().findById.mockResolvedValue(null);

      await expect(
        service.storeRespond(returnId, { approved: true }, storeOwnerId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when already processed', async () => {
      mockRepository.getModel().findById.mockResolvedValue({
        ...mockReturnRequest,
        status: ReturnStatus.APPROVED,
      });

      await expect(
        service.storeRespond(returnId, { approved: true }, storeOwnerId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should approve return request', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockReturnRequest);
      mockRepository.getModel().findById.mockResolvedValue({
        ...mockReturnRequest,
        save: saveMock,
      });

      await service.storeRespond(returnId, { approved: true }, storeOwnerId);

      expect(saveMock).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'return.store.responded',
        expect.any(Object),
      );
    });
  });

  describe('adminReview', () => {
    it('should throw BadRequestException for invalid ID', async () => {
      await expect(
        service.adminReview('invalid-id', { approved: true }, adminId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when return not found', async () => {
      mockRepository.getModel().findById.mockResolvedValue(null);

      await expect(
        service.adminReview(returnId, { approved: true }, adminId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should approve rejected return', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockReturnRequest);
      mockRepository.getModel().findById.mockResolvedValue({
        ...mockReturnRequest,
        status: ReturnStatus.REJECTED,
        save: saveMock,
      });

      await service.adminReview(returnId, { approved: true }, adminId);

      expect(saveMock).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'return.admin.reviewed',
        expect.any(Object),
      );
    });
  });
});
