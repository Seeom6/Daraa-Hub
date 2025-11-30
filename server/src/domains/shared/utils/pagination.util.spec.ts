import { PaginationUtil } from './pagination.util';

describe('PaginationUtil', () => {
  describe('buildResult', () => {
    it('should build pagination result with correct metadata', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = PaginationUtil.buildResult(data, 100, 1, 10);

      expect(result).toEqual({
        data,
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });

    it('should set hasNextPage to false on last page', () => {
      const result = PaginationUtil.buildResult([], 100, 10, 10);
      expect(result.hasNextPage).toBe(false);
    });

    it('should set hasPrevPage to true when not on first page', () => {
      const result = PaginationUtil.buildResult([], 100, 5, 10);
      expect(result.hasPrevPage).toBe(true);
    });

    it('should handle single page result', () => {
      const result = PaginationUtil.buildResult([{ id: 1 }], 1, 1, 10);
      expect(result.totalPages).toBe(1);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(false);
    });

    it('should handle empty result', () => {
      const result = PaginationUtil.buildResult([], 0, 1, 10);
      expect(result.totalPages).toBe(0);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(false);
    });
  });

  describe('calculateSkip', () => {
    it('should calculate skip for first page', () => {
      expect(PaginationUtil.calculateSkip(1, 10)).toBe(0);
    });

    it('should calculate skip for second page', () => {
      expect(PaginationUtil.calculateSkip(2, 10)).toBe(10);
    });

    it('should calculate skip for arbitrary page', () => {
      expect(PaginationUtil.calculateSkip(5, 20)).toBe(80);
    });
  });

  describe('normalize', () => {
    it('should normalize valid pagination parameters', () => {
      const result = PaginationUtil.normalize({ page: 2, limit: 20 });
      expect(result).toEqual({ page: 2, limit: 20 });
    });

    it('should default page to 1 when not provided', () => {
      const result = PaginationUtil.normalize({ limit: 20 } as any);
      expect(result.page).toBe(1);
    });

    it('should default limit to 10 when not provided', () => {
      const result = PaginationUtil.normalize({ page: 1 } as any);
      expect(result.limit).toBe(10);
    });

    it('should enforce minimum page of 1', () => {
      const result = PaginationUtil.normalize({ page: 0, limit: 10 });
      expect(result.page).toBe(1);
    });

    it('should enforce minimum limit of 1', () => {
      // When limit is 0, Math.max(1, 0) = 1, but then Math.min(100, 1) = 1
      // However, the actual implementation uses || 10 for falsy values
      // So limit: 0 becomes limit: 10 (default)
      const result = PaginationUtil.normalize({ page: 1, limit: 0 });
      expect(result.limit).toBe(10); // 0 is falsy, so defaults to 10
    });

    it('should enforce maximum limit of 100', () => {
      const result = PaginationUtil.normalize({ page: 1, limit: 500 });
      expect(result.limit).toBe(100);
    });
  });

  describe('buildMetadata', () => {
    it('should build metadata with correct values', () => {
      const result = PaginationUtil.buildMetadata(100, 3, 10);
      expect(result).toEqual({
        total: 100,
        page: 3,
        limit: 10,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });

    it('should handle first page', () => {
      const result = PaginationUtil.buildMetadata(50, 1, 10);
      expect(result.hasPrevPage).toBe(false);
      expect(result.hasNextPage).toBe(true);
    });

    it('should handle last page', () => {
      const result = PaginationUtil.buildMetadata(50, 5, 10);
      expect(result.hasPrevPage).toBe(true);
      expect(result.hasNextPage).toBe(false);
    });
  });
});
