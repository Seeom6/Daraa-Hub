import {
  BaseResponseDto,
  PaginatedResponseDto,
  ResponseBuilder,
} from './base-response.dto';

describe('BaseResponseDto', () => {
  describe('constructor', () => {
    it('should create success response with data', () => {
      const response = new BaseResponseDto(true, 'Success', { id: 1 });

      expect(response.success).toBe(true);
      expect(response.message).toBe('Success');
      expect(response.data).toEqual({ id: 1 });
      expect(response.error).toBeUndefined();
      expect(response.timestamp).toBeDefined();
    });

    it('should create error response with error details', () => {
      const response = new BaseResponseDto(false, 'Error', undefined, {
        code: 'ERR001',
      });

      expect(response.success).toBe(false);
      expect(response.message).toBe('Error');
      expect(response.data).toBeUndefined();
      expect(response.error).toEqual({ code: 'ERR001' });
    });
  });

  describe('static success', () => {
    it('should create success response', () => {
      const response = BaseResponseDto.success('Operation successful', {
        result: 'ok',
      });

      expect(response.success).toBe(true);
      expect(response.message).toBe('Operation successful');
      expect(response.data).toEqual({ result: 'ok' });
    });

    it('should create success response without data', () => {
      const response = BaseResponseDto.success('Done');

      expect(response.success).toBe(true);
      expect(response.data).toBeUndefined();
    });
  });

  describe('static error', () => {
    it('should create error response', () => {
      const response = BaseResponseDto.error('Something went wrong', {
        details: 'error',
      });

      expect(response.success).toBe(false);
      expect(response.message).toBe('Something went wrong');
      expect(response.error).toEqual({ details: 'error' });
    });

    it('should create error response without error details', () => {
      const response = BaseResponseDto.error('Failed');

      expect(response.success).toBe(false);
      expect(response.error).toBeUndefined();
    });
  });
});

describe('PaginatedResponseDto', () => {
  describe('constructor', () => {
    it('should create paginated response', () => {
      const meta = {
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: false,
      };
      const response = new PaginatedResponseDto(
        'Items retrieved',
        [{ id: 1 }],
        meta,
      );

      expect(response.success).toBe(true);
      expect(response.message).toBe('Items retrieved');
      expect(response.data).toEqual([{ id: 1 }]);
      expect(response.meta).toEqual(meta);
    });
  });

  describe('static create', () => {
    it('should create paginated response with calculated meta', () => {
      const response = PaginatedResponseDto.create(
        'Items',
        [{ id: 1 }],
        100,
        1,
        10,
      );

      expect(response.meta.total).toBe(100);
      expect(response.meta.page).toBe(1);
      expect(response.meta.limit).toBe(10);
      expect(response.meta.totalPages).toBe(10);
      expect(response.meta.hasNextPage).toBe(true);
      expect(response.meta.hasPrevPage).toBe(false);
    });

    it('should calculate hasNextPage correctly for last page', () => {
      const response = PaginatedResponseDto.create(
        'Items',
        [{ id: 1 }],
        100,
        10,
        10,
      );

      expect(response.meta.hasNextPage).toBe(false);
      expect(response.meta.hasPrevPage).toBe(true);
    });

    it('should calculate hasPrevPage correctly for first page', () => {
      const response = PaginatedResponseDto.create(
        'Items',
        [{ id: 1 }],
        100,
        1,
        10,
      );

      expect(response.meta.hasPrevPage).toBe(false);
    });

    it('should handle middle page correctly', () => {
      const response = PaginatedResponseDto.create(
        'Items',
        [{ id: 1 }],
        100,
        5,
        10,
      );

      expect(response.meta.hasNextPage).toBe(true);
      expect(response.meta.hasPrevPage).toBe(true);
    });
  });
});

describe('ResponseBuilder', () => {
  describe('success', () => {
    it('should build success response', () => {
      const response = ResponseBuilder.success('Success', { data: 'test' });

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ data: 'test' });
    });
  });

  describe('error', () => {
    it('should build error response', () => {
      const response = ResponseBuilder.error('Error', { code: 'ERR' });

      expect(response.success).toBe(false);
      expect(response.error).toEqual({ code: 'ERR' });
    });
  });

  describe('paginated', () => {
    it('should build paginated response', () => {
      const response = ResponseBuilder.paginated(
        'Items',
        [{ id: 1 }],
        50,
        2,
        10,
      );

      expect(response.meta.total).toBe(50);
      expect(response.meta.page).toBe(2);
    });
  });

  describe('created', () => {
    it('should build created response', () => {
      const response = ResponseBuilder.created('Created', { id: 1 });

      expect(response.success).toBe(true);
      expect(response.message).toBe('Created');
    });
  });

  describe('updated', () => {
    it('should build updated response', () => {
      const response = ResponseBuilder.updated('Updated', { id: 1 });

      expect(response.success).toBe(true);
      expect(response.message).toBe('Updated');
    });
  });

  describe('deleted', () => {
    it('should build deleted response', () => {
      const response = ResponseBuilder.deleted('Deleted');

      expect(response.success).toBe(true);
      expect(response.message).toBe('Deleted');
    });
  });

  describe('notFound', () => {
    it('should build not found response', () => {
      const response = ResponseBuilder.notFound('Not found');

      expect(response.success).toBe(false);
      expect(response.error).toEqual({ statusCode: 404 });
    });
  });

  describe('badRequest', () => {
    it('should build bad request response', () => {
      const response = ResponseBuilder.badRequest('Bad request', {
        field: 'name',
      });

      expect(response.success).toBe(false);
      expect(response.error).toEqual({ statusCode: 400, field: 'name' });
    });

    it('should build bad request response without extra error', () => {
      const response = ResponseBuilder.badRequest('Bad request');

      expect(response.error).toEqual({ statusCode: 400 });
    });
  });

  describe('unauthorized', () => {
    it('should build unauthorized response', () => {
      const response = ResponseBuilder.unauthorized('Unauthorized');

      expect(response.success).toBe(false);
      expect(response.error).toEqual({ statusCode: 401 });
    });
  });

  describe('forbidden', () => {
    it('should build forbidden response', () => {
      const response = ResponseBuilder.forbidden('Forbidden');

      expect(response.success).toBe(false);
      expect(response.error).toEqual({ statusCode: 403 });
    });
  });
});
