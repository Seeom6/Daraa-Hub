import 'reflect-metadata';
import { PaginationDto } from './pagination.dto';

describe('PaginationDto', () => {
  describe('default values', () => {
    it('should have default page of 1', () => {
      const dto = new PaginationDto();
      expect(dto.page).toBe(1);
    });

    it('should have default limit of 10', () => {
      const dto = new PaginationDto();
      expect(dto.limit).toBe(10);
    });
  });

  describe('skip getter', () => {
    it('should calculate skip correctly for page 1', () => {
      const dto = new PaginationDto();
      dto.page = 1;
      dto.limit = 10;
      expect(dto.skip).toBe(0);
    });

    it('should calculate skip correctly for page 2', () => {
      const dto = new PaginationDto();
      dto.page = 2;
      dto.limit = 10;
      expect(dto.skip).toBe(10);
    });

    it('should calculate skip correctly for page 3 with limit 20', () => {
      const dto = new PaginationDto();
      dto.page = 3;
      dto.limit = 20;
      expect(dto.skip).toBe(40);
    });

    it('should handle undefined page using default', () => {
      const dto = new PaginationDto();
      dto.page = undefined;
      dto.limit = 10;
      expect(dto.skip).toBe(0);
    });

    it('should handle undefined limit using default', () => {
      const dto = new PaginationDto();
      dto.page = 2;
      dto.limit = undefined;
      expect(dto.skip).toBe(10);
    });

    it('should handle both undefined using defaults', () => {
      const dto = new PaginationDto();
      dto.page = undefined;
      dto.limit = undefined;
      expect(dto.skip).toBe(0);
    });
  });

  describe('custom values', () => {
    it('should accept custom page value', () => {
      const dto = new PaginationDto();
      dto.page = 5;
      expect(dto.page).toBe(5);
    });

    it('should accept custom limit value', () => {
      const dto = new PaginationDto();
      dto.limit = 50;
      expect(dto.limit).toBe(50);
    });
  });
});
