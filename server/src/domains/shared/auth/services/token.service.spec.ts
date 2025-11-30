import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { generateObjectId } from '../../testing';

describe('TokenService', () => {
  let service: TokenService;
  let mockJwtService: any;
  let mockConfigService: any;

  const mockPayload = {
    sub: generateObjectId(),
    phone: '+963991234567',
    role: 'customer',
  };

  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocktoken';

  beforeEach(async () => {
    mockJwtService = {
      sign: jest.fn().mockReturnValue(mockToken),
      verify: jest.fn().mockReturnValue(mockPayload),
      decode: jest.fn().mockReturnValue(mockPayload),
    };

    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'jwt.accessTokenExpiry') return '15m';
        if (key === 'jwt.refreshTokenExpiry') return '7d';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate access token', () => {
      const result = service.generateAccessToken(mockPayload);

      expect(result).toBe(mockToken);
      expect(mockJwtService.sign).toHaveBeenCalledWith(mockPayload, {
        expiresIn: '15m',
      });
    });

    it('should use default expiry if config not set', () => {
      mockConfigService.get.mockReturnValue(null);

      service.generateAccessToken(mockPayload);

      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token', () => {
      const result = service.generateRefreshToken(mockPayload);

      expect(result).toBe(mockToken);
      expect(mockJwtService.sign).toHaveBeenCalledWith(mockPayload, {
        expiresIn: '7d',
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify token', () => {
      const result = service.verifyToken(mockToken);

      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockToken);
    });

    it('should throw on invalid token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.verifyToken('invalid')).toThrow('Invalid token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify refresh token', () => {
      const result = service.verifyRefreshToken(mockToken);

      expect(result).toEqual(mockPayload);
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const result = service.decodeToken(mockToken);

      expect(result).toEqual(mockPayload);
      expect(mockJwtService.decode).toHaveBeenCalledWith(mockToken);
    });
  });
});
