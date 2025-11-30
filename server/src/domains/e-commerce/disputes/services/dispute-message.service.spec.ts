import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DisputeMessageService } from './dispute-message.service';
import { DisputeRepository } from '../repositories/dispute.repository';
import { DisputeStatus } from '../../../../database/schemas/dispute.schema';

describe('DisputeMessageService', () => {
  let service: DisputeMessageService;
  let disputeRepository: jest.Mocked<DisputeRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockDisputeId = new Types.ObjectId();
  const mockUserId = new Types.ObjectId().toString();

  const createMockDispute = (status: DisputeStatus = DisputeStatus.OPEN) => ({
    _id: mockDisputeId,
    status,
    messages: [],
    save: jest.fn().mockResolvedValue(true),
  });

  beforeEach(async () => {
    const mockModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeMessageService,
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

    service = module.get<DisputeMessageService>(DisputeMessageService);
    disputeRepository = module.get(DisputeRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('addMessage', () => {
    const addMessageDto = {
      message: 'Test message',
      isAdminMessage: false,
    };

    it('should add message to dispute successfully', async () => {
      const mockDispute = createMockDispute();
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockDispute,
      );

      const result = await service.addMessage(
        mockDisputeId.toString(),
        addMessageDto,
        mockUserId,
      );

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].message).toBe('Test message');
      expect(mockDispute.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'dispute.message.added',
        expect.any(Object),
      );
    });

    it('should add admin message', async () => {
      const mockDispute = createMockDispute();
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockDispute,
      );

      await service.addMessage(
        mockDisputeId.toString(),
        { message: 'Admin reply', isAdminMessage: true },
        mockUserId,
      );

      expect(mockDispute.messages[0].isAdminMessage).toBe(true);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(
        service.addMessage('invalid-id', addMessageDto, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when dispute not found', async () => {
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.addMessage(mockDisputeId.toString(), addMessageDto, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when dispute is closed', async () => {
      const mockDispute = createMockDispute(DisputeStatus.CLOSED);
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockDispute,
      );

      await expect(
        service.addMessage(mockDisputeId.toString(), addMessageDto, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when dispute is resolved', async () => {
      const mockDispute = createMockDispute(DisputeStatus.RESOLVED);
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockDispute,
      );

      await expect(
        service.addMessage(mockDisputeId.toString(), addMessageDto, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use default value for isAdminMessage', async () => {
      const mockDispute = createMockDispute();
      (disputeRepository.getModel().findById as jest.Mock).mockResolvedValue(
        mockDispute,
      );

      await service.addMessage(
        mockDisputeId.toString(),
        { message: 'Test' },
        mockUserId,
      );

      expect(mockDispute.messages[0].isAdminMessage).toBe(false);
    });
  });
});
