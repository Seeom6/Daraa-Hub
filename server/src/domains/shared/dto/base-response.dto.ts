/**
 * Base Response DTO
 * Standard response format for all API endpoints
 */
export class BaseResponseDto<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  timestamp: string;

  constructor(success: boolean, message: string, data?: T, error?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(message: string, data?: T): BaseResponseDto<T> {
    return new BaseResponseDto(true, message, data);
  }

  static error(message: string, error?: any): BaseResponseDto {
    return new BaseResponseDto(false, message, undefined, error);
  }
}

/**
 * Paginated Response DTO
 * Standard response format for paginated endpoints
 */
export class PaginatedResponseDto<T = any> extends BaseResponseDto<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  constructor(
    message: string,
    data: T[],
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    },
  ) {
    super(true, message, data);
    this.meta = meta;
  }

  static create<T>(
    message: string,
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponseDto<T> {
    const totalPages = Math.ceil(total / limit);
    return new PaginatedResponseDto(message, data, {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  }
}

/**
 * Response Builder Utility
 * Helper class for building consistent API responses
 */
export class ResponseBuilder {
  /**
   * Build success response
   */
  static success<T>(message: string, data?: T): BaseResponseDto<T> {
    return BaseResponseDto.success(message, data);
  }

  /**
   * Build error response
   */
  static error(message: string, error?: any): BaseResponseDto {
    return BaseResponseDto.error(message, error);
  }

  /**
   * Build paginated response
   */
  static paginated<T>(
    message: string,
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponseDto<T> {
    return PaginatedResponseDto.create(message, data, total, page, limit);
  }

  /**
   * Build created response
   */
  static created<T>(message: string, data: T): BaseResponseDto<T> {
    return BaseResponseDto.success(message, data);
  }

  /**
   * Build updated response
   */
  static updated<T>(message: string, data: T): BaseResponseDto<T> {
    return BaseResponseDto.success(message, data);
  }

  /**
   * Build deleted response
   */
  static deleted(message: string): BaseResponseDto {
    return BaseResponseDto.success(message);
  }

  /**
   * Build not found response
   */
  static notFound(message: string): BaseResponseDto {
    return BaseResponseDto.error(message, { statusCode: 404 });
  }

  /**
   * Build bad request response
   */
  static badRequest(message: string, error?: any): BaseResponseDto {
    return BaseResponseDto.error(message, { statusCode: 400, ...error });
  }

  /**
   * Build unauthorized response
   */
  static unauthorized(message: string): BaseResponseDto {
    return BaseResponseDto.error(message, { statusCode: 401 });
  }

  /**
   * Build forbidden response
   */
  static forbidden(message: string): BaseResponseDto {
    return BaseResponseDto.error(message, { statusCode: 403 });
  }
}

