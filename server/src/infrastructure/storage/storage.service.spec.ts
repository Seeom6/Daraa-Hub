import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';

// Mock AWS SDK
const mockSend = jest.fn();
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  PutObjectCommand: jest.fn().mockImplementation((params) => params),
  DeleteObjectCommand: jest.fn().mockImplementation((params) => params),
  GetObjectCommand: jest.fn().mockImplementation((params) => params),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.example.com'),
}));

describe('StorageService', () => {
  let service: StorageService;

  const mockAwsConfig = {
    region: 'us-east-1',
    accessKeyId: 'test-access-key',
    secretAccessKey: 'test-secret-key',
    s3: {
      bucket: 'test-bucket',
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'aws') return mockAwsConfig;
              if (key === 'aws.region') return 'us-east-1';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      mockSend.mockResolvedValue({});

      const mockFile: Express.Multer.File = {
        originalname: 'test-image.jpg',
        buffer: Buffer.from('test content'),
        mimetype: 'image/jpeg',
        fieldname: 'file',
        encoding: '7bit',
        size: 12,
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
      };

      const result = await service.uploadFile(mockFile, 'images');

      expect(result).toHaveProperty('key');
      expect(result).toHaveProperty('url');
      expect(result.bucket).toBe('test-bucket');
      expect(result.key).toContain('images/');
      expect(result.key).toContain('test-image.jpg');
    });

    it('should use default folder if not specified', async () => {
      mockSend.mockResolvedValue({});

      const mockFile: Express.Multer.File = {
        originalname: 'document.pdf',
        buffer: Buffer.from('pdf content'),
        mimetype: 'application/pdf',
        fieldname: 'file',
        encoding: '7bit',
        size: 11,
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
      };

      const result = await service.uploadFile(mockFile);

      expect(result.key).toContain('uploads/');
    });

    it('should throw error on upload failure', async () => {
      mockSend.mockRejectedValue(new Error('S3 Error'));

      const mockFile: Express.Multer.File = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
        fieldname: 'file',
        encoding: '7bit',
        size: 4,
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
      };

      await expect(service.uploadFile(mockFile)).rejects.toThrow('S3 Error');
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      mockSend.mockResolvedValue({});

      const result = await service.deleteFile('images/test-image.jpg');

      expect(result).toBe(true);
    });

    it('should return false on delete failure', async () => {
      mockSend.mockRejectedValue(new Error('Delete failed'));

      const result = await service.deleteFile('non-existent.jpg');

      expect(result).toBe(false);
    });
  });

  describe('getSignedUrl', () => {
    it('should generate signed URL', async () => {
      const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

      const result = await service.getSignedUrl('images/private-image.jpg');

      expect(result).toBe('https://signed-url.example.com');
      expect(getSignedUrl).toHaveBeenCalled();
    });

    it('should throw error on failure', async () => {
      const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
      getSignedUrl.mockRejectedValueOnce(new Error('Signing failed'));

      await expect(service.getSignedUrl('test.jpg')).rejects.toThrow(
        'Signing failed',
      );
    });
  });

  describe('uploadBuffer', () => {
    it('should upload buffer successfully', async () => {
      mockSend.mockResolvedValue({});

      const result = await service.uploadBuffer(
        Buffer.from('test content'),
        'test-file.txt',
        'text/plain',
        'documents',
      );

      expect(result).toHaveProperty('key');
      expect(result.key).toContain('documents/');
      expect(result.key).toContain('test-file.txt');
    });

    it('should throw error on buffer upload failure', async () => {
      mockSend.mockRejectedValue(new Error('Upload failed'));

      await expect(
        service.uploadBuffer(Buffer.from('test'), 'test.txt', 'text/plain'),
      ).rejects.toThrow('Upload failed');
    });
  });
});
