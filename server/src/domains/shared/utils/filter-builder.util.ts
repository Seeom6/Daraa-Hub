import { FilterQuery } from 'mongoose';

/**
 * Filter Builder Utility Class
 * Provides helper methods for building MongoDB filters
 */
export class FilterBuilderUtil {
  /**
   * Build text search filter
   * @example buildTextSearch('name', 'samsung') => { name: { $regex: 'samsung', $options: 'i' } }
   */
  static buildTextSearch(field: string, value: string): FilterQuery<any> {
    if (!value) return {};
    return {
      [field]: { $regex: value, $options: 'i' },
    };
  }

  /**
   * Build range filter
   * @example buildRange('price', 100, 500) => { price: { $gte: 100, $lte: 500 } }
   */
  static buildRange(
    field: string,
    min?: number,
    max?: number,
  ): FilterQuery<any> {
    const filter: any = {};

    if (min !== undefined && max !== undefined) {
      filter[field] = { $gte: min, $lte: max };
    } else if (min !== undefined) {
      filter[field] = { $gte: min };
    } else if (max !== undefined) {
      filter[field] = { $lte: max };
    }

    return filter;
  }

  /**
   * Build date range filter
   * @example buildDateRange('createdAt', startDate, endDate)
   */
  static buildDateRange(
    field: string,
    startDate?: Date,
    endDate?: Date,
  ): FilterQuery<any> {
    const filter: any = {};

    if (startDate && endDate) {
      filter[field] = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter[field] = { $gte: startDate };
    } else if (endDate) {
      filter[field] = { $lte: endDate };
    }

    return filter;
  }

  /**
   * Build in filter
   * @example buildIn('status', ['active', 'pending']) => { status: { $in: ['active', 'pending'] } }
   */
  static buildIn(field: string, values: any[]): FilterQuery<any> {
    if (!values || values.length === 0) return {};
    return {
      [field]: { $in: values },
    };
  }

  /**
   * Build not in filter
   * @example buildNotIn('status', ['deleted']) => { status: { $nin: ['deleted'] } }
   */
  static buildNotIn(field: string, values: any[]): FilterQuery<any> {
    if (!values || values.length === 0) return {};
    return {
      [field]: { $nin: values },
    };
  }

  /**
   * Build exists filter
   * @example buildExists('deletedAt', false) => { deletedAt: { $exists: false } }
   */
  static buildExists(field: string, exists: boolean): FilterQuery<any> {
    return {
      [field]: { $exists: exists },
    };
  }

  /**
   * Merge multiple filters with AND logic
   */
  static mergeFilters(...filters: FilterQuery<any>[]): FilterQuery<any> {
    return Object.assign({}, ...filters);
  }

  /**
   * Build OR filter
   * @example buildOr([{ name: 'test' }, { code: 'test' }]) => { $or: [...] }
   */
  static buildOr(filters: FilterQuery<any>[]): FilterQuery<any> {
    if (filters.length === 0) return {};
    if (filters.length === 1) return filters[0];
    return { $or: filters };
  }

  /**
   * Build AND filter
   * @example buildAnd([{ status: 'active' }, { isDeleted: false }]) => { $and: [...] }
   */
  static buildAnd(filters: FilterQuery<any>[]): FilterQuery<any> {
    if (filters.length === 0) return {};
    if (filters.length === 1) return filters[0];
    return { $and: filters };
  }

  /**
   * Build soft delete filter
   */
  static buildSoftDeleteFilter(includeDeleted = false): FilterQuery<any> {
    if (includeDeleted) return {};
    return { isDeleted: false };
  }

  /**
   * Build sort object from string
   * @example buildSort('-createdAt,name') => { createdAt: -1, name: 1 }
   */
  static buildSort(sortString?: string): Record<string, 1 | -1> | undefined {
    if (!sortString) return undefined;

    const sortFields = sortString.split(',');
    const sort: Record<string, 1 | -1> = {};

    for (const field of sortFields) {
      if (field.startsWith('-')) {
        sort[field.substring(1)] = -1;
      } else {
        sort[field] = 1;
      }
    }

    return sort;
  }
}

