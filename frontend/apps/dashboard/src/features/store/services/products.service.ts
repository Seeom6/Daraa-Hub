/**
 * Products Service
 * API service for products management
 */

import apiClient, { uploadFiles } from '@/lib/api-client';
import type {
  Product,
  ProductsResponse,
  ApiResponse,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
} from '../types';

class ProductsService {
  private readonly baseUrl = '/products';

  /**
   * Get all products (paginated)
   * @param filters - Filter options including storeId
   */
  async getProducts(filters?: ProductFilters): Promise<{
    data: Product[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const response = await apiClient.get<ProductsResponse>(this.baseUrl, {
      params: filters,
    });
    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  }

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`${this.baseUrl}/${id}`);
    return response.data.data!;
  }

  /**
   * Create product
   * @param data - Product data including storeId and categoryId
   */
  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>(this.baseUrl, data);
    return response.data.data!;
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(`${this.baseUrl}/${id}`, data);
    return response.data.data!;
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Upload product images
   */
  async uploadImages(files: File[]): Promise<string[]> {
    return uploadFiles(files, `${this.baseUrl}/upload/images`);
  }
}

export const productsService = new ProductsService();

