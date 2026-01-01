/**
 * useProducts Hook
 * React Query hook for products management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { productsService } from '../services';
import { useProductsStore } from '../stores';
import type { CreateProductDto, UpdateProductDto, ProductFilters } from '../types';

export function useProducts(filters?: ProductFilters, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const { setProducts, addProduct, updateProduct: updateProductStore, removeProduct } = useProductsStore();

  // Get products
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const result = await productsService.getProducts(filters);
      setProducts(result.data);
      return result;
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    enabled: options?.enabled !== false, // Default to true
  });

  // Create product
  const createMutation = useMutation({
    mutationFn: (data: CreateProductDto) => productsService.createProduct(data),
    onSuccess: (newProduct) => {
      addProduct(newProduct);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم إنشاء المنتج بنجاح');
    },
    onError: () => {
      toast.error('فشل إنشاء المنتج');
    },
  });

  // Update product
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productsService.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      updateProductStore(updatedProduct._id, updatedProduct);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', updatedProduct._id] });
      toast.success('تم تحديث المنتج بنجاح');
    },
    onError: () => {
      toast.error('فشل تحديث المنتج');
    },
  });

  // Delete product
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsService.deleteProduct(id),
    onSuccess: (_, id) => {
      removeProduct(id);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم حذف المنتج بنجاح');
    },
    onError: () => {
      toast.error('فشل حذف المنتج');
    },
  });

  // Upload images
  const uploadImagesMutation = useMutation({
    mutationFn: (files: File[]) => productsService.uploadImages(files),
    onError: () => {
      toast.error('فشل رفع الصور');
    },
  });

  return {
    products: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
    createProduct: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateProduct: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteProduct: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    uploadImages: uploadImagesMutation.mutateAsync,
    isUploadingImages: uploadImagesMutation.isPending,
  };
}

// Get single product
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsService.getProduct(id),
    enabled: !!id,
  });
}



