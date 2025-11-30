import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * Pagination Result Interface
 */
export interface IPaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Pagination Utility Class
 * Provides helper methods for pagination
 */
export class PaginationUtil {
  /**
   * Build pagination result
   */
  static buildResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): IPaginationResult<T> {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  /**
   * Calculate skip value for pagination
   */
  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Validate and normalize pagination parameters
   */
  static normalize(pagination: PaginationDto): { page: number; limit: number } {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 10));
    return { page, limit };
  }

  /**
   * Build pagination metadata
   */
  static buildMetadata(total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
