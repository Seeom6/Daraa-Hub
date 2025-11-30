import { FilterBuilderUtil } from './filter-builder.util';

describe('FilterBuilderUtil', () => {
  describe('buildTextSearch', () => {
    it('should build text search filter with regex', () => {
      const result = FilterBuilderUtil.buildTextSearch('name', 'samsung');
      expect(result).toEqual({ name: { $regex: 'samsung', $options: 'i' } });
    });

    it('should return empty object when value is empty', () => {
      expect(FilterBuilderUtil.buildTextSearch('name', '')).toEqual({});
    });
  });

  describe('buildRange', () => {
    it('should build range filter with min and max', () => {
      const result = FilterBuilderUtil.buildRange('price', 100, 500);
      expect(result).toEqual({ price: { $gte: 100, $lte: 500 } });
    });

    it('should build filter with only min', () => {
      const result = FilterBuilderUtil.buildRange('price', 100, undefined);
      expect(result).toEqual({ price: { $gte: 100 } });
    });

    it('should build filter with only max', () => {
      const result = FilterBuilderUtil.buildRange('price', undefined, 500);
      expect(result).toEqual({ price: { $lte: 500 } });
    });

    it('should return empty object when no min or max', () => {
      const result = FilterBuilderUtil.buildRange(
        'price',
        undefined,
        undefined,
      );
      expect(result).toEqual({});
    });
  });

  describe('buildDateRange', () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-12-31');

    it('should build date range filter with start and end', () => {
      const result = FilterBuilderUtil.buildDateRange(
        'createdAt',
        startDate,
        endDate,
      );
      expect(result).toEqual({ createdAt: { $gte: startDate, $lte: endDate } });
    });

    it('should build filter with only start date', () => {
      const result = FilterBuilderUtil.buildDateRange(
        'createdAt',
        startDate,
        undefined,
      );
      expect(result).toEqual({ createdAt: { $gte: startDate } });
    });

    it('should build filter with only end date', () => {
      const result = FilterBuilderUtil.buildDateRange(
        'createdAt',
        undefined,
        endDate,
      );
      expect(result).toEqual({ createdAt: { $lte: endDate } });
    });

    it('should return empty object when no dates', () => {
      const result = FilterBuilderUtil.buildDateRange(
        'createdAt',
        undefined,
        undefined,
      );
      expect(result).toEqual({});
    });
  });

  describe('buildIn', () => {
    it('should build in filter', () => {
      const result = FilterBuilderUtil.buildIn('status', ['active', 'pending']);
      expect(result).toEqual({ status: { $in: ['active', 'pending'] } });
    });

    it('should return empty object when values is empty', () => {
      expect(FilterBuilderUtil.buildIn('status', [])).toEqual({});
    });

    it('should return empty object when values is null', () => {
      expect(FilterBuilderUtil.buildIn('status', null as any)).toEqual({});
    });
  });

  describe('buildNotIn', () => {
    it('should build not in filter', () => {
      const result = FilterBuilderUtil.buildNotIn('status', ['deleted']);
      expect(result).toEqual({ status: { $nin: ['deleted'] } });
    });

    it('should return empty object when values is empty', () => {
      expect(FilterBuilderUtil.buildNotIn('status', [])).toEqual({});
    });
  });

  describe('buildExists', () => {
    it('should build exists true filter', () => {
      const result = FilterBuilderUtil.buildExists('deletedAt', true);
      expect(result).toEqual({ deletedAt: { $exists: true } });
    });

    it('should build exists false filter', () => {
      const result = FilterBuilderUtil.buildExists('deletedAt', false);
      expect(result).toEqual({ deletedAt: { $exists: false } });
    });
  });

  describe('mergeFilters', () => {
    it('should merge multiple filters', () => {
      const result = FilterBuilderUtil.mergeFilters(
        { name: 'test' },
        { status: 'active' },
        { isDeleted: false },
      );
      expect(result).toEqual({
        name: 'test',
        status: 'active',
        isDeleted: false,
      });
    });
  });

  describe('buildOr', () => {
    it('should build OR filter with multiple conditions', () => {
      const result = FilterBuilderUtil.buildOr([
        { name: 'test' },
        { code: 'test' },
      ]);
      expect(result).toEqual({ $or: [{ name: 'test' }, { code: 'test' }] });
    });

    it('should return single filter when only one condition', () => {
      const result = FilterBuilderUtil.buildOr([{ name: 'test' }]);
      expect(result).toEqual({ name: 'test' });
    });

    it('should return empty object when no conditions', () => {
      expect(FilterBuilderUtil.buildOr([])).toEqual({});
    });
  });

  describe('buildAnd', () => {
    it('should build AND filter with multiple conditions', () => {
      const result = FilterBuilderUtil.buildAnd([
        { status: 'active' },
        { isDeleted: false },
      ]);
      expect(result).toEqual({
        $and: [{ status: 'active' }, { isDeleted: false }],
      });
    });

    it('should return single filter when only one condition', () => {
      const result = FilterBuilderUtil.buildAnd([{ status: 'active' }]);
      expect(result).toEqual({ status: 'active' });
    });

    it('should return empty object when no conditions', () => {
      expect(FilterBuilderUtil.buildAnd([])).toEqual({});
    });
  });

  describe('buildSoftDeleteFilter', () => {
    it('should return isDeleted false by default', () => {
      expect(FilterBuilderUtil.buildSoftDeleteFilter()).toEqual({
        isDeleted: false,
      });
    });

    it('should return empty object when includeDeleted is true', () => {
      expect(FilterBuilderUtil.buildSoftDeleteFilter(true)).toEqual({});
    });
  });

  describe('buildSort', () => {
    it('should build sort object from string', () => {
      const result = FilterBuilderUtil.buildSort('-createdAt,name');
      expect(result).toEqual({ createdAt: -1, name: 1 });
    });

    it('should handle single descending field', () => {
      const result = FilterBuilderUtil.buildSort('-createdAt');
      expect(result).toEqual({ createdAt: -1 });
    });

    it('should handle single ascending field', () => {
      const result = FilterBuilderUtil.buildSort('name');
      expect(result).toEqual({ name: 1 });
    });

    it('should return undefined when sortString is empty', () => {
      expect(FilterBuilderUtil.buildSort('')).toBeUndefined();
      expect(FilterBuilderUtil.buildSort(undefined)).toBeUndefined();
    });
  });
});
