import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VerificationDocumentService } from './verification-document.service';
import { VerificationRequest } from '../../../../database/schemas/verification-request.schema';
import { StorageService } from '../../../../infrastructure/storage/storage.service';
import { generateObjectId } from '../../testing';

describe('VerificationDocumentService', () => {
  let service: VerificationDocumentService;
  let mockModel: any;
  let mockStorageService: any;

  const mockVerificationRequest = {
    _id: generateObjectId(),
    status: 'pending',
    documents: [],
    save: jest.fn().mockResolvedValue(true),
  };

  const mockFile = {
    originalname: 'document.pdf',
    buffer: Buffer.from('test'),
    mimetype: 'application/pdf',
  } as Express.Multer.File;

  beforeEach(async () => {
    mockModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVerificationRequest),
      }),
    };

    mockStorageService = {
      uploadFile: jest
        .fn()
        .mockResolvedValue({ url: 'https://s3.example.com/document.pdf' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationDocumentService,
        {
          provide: getModelToken(VerificationRequest.name),
          useValue: mockModel,
        },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<VerificationDocumentService>(
      VerificationDocumentService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockVerificationRequest.documents = [];
    mockVerificationRequest.status = 'pending';
  });

  describe('uploadDocument', () => {
    it('should upload document successfully', async () => {
      await service.uploadDocument(
        mockVerificationRequest._id,
        mockFile,
        'id_card',
        'Front side',
      );

      expect(mockStorageService.uploadFile).toHaveBeenCalled();
      expect(mockVerificationRequest.documents.length).toBe(1);
      expect(mockVerificationRequest.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if verification request not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.uploadDocument('invalid', mockFile, 'id_card'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if request is approved', async () => {
      mockVerificationRequest.status = 'approved';

      await expect(
        service.uploadDocument(
          mockVerificationRequest._id,
          mockFile,
          'id_card',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if request is rejected', async () => {
      mockVerificationRequest.status = 'rejected';

      await expect(
        service.uploadDocument(
          mockVerificationRequest._id,
          mockFile,
          'id_card',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
