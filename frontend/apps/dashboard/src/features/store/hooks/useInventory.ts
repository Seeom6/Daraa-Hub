/**
 * useInventory Hook
 * React Query hook for inventory management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { inventoryService, type Inventory, type InventoryFilters } from '../services/inventory.service';
import type {
  CreateInventoryDto,
  UpdateInventoryDto,
  AddStockDto,
  RemoveStockDto,
} from '../types/dto.types';

export function useInventory(filters?: InventoryFilters) {
  const queryClient = useQueryClient();

  // Get inventory
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['inventory', filters],
    queryFn: () => inventoryService.getInventory(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Create inventory
  const createMutation = useMutation({
    mutationFn: (data: CreateInventoryDto) => inventoryService.createInventory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('تم إنشاء سجل المخزون بنجاح');
    },
    onError: () => {
      toast.error('فشل إنشاء سجل المخزون');
    },
  });

  // Update inventory
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryDto }) =>
      inventoryService.updateInventory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('تم تحديث المخزون بنجاح');
    },
    onError: () => {
      toast.error('فشل تحديث المخزون');
    },
  });

  // Add stock
  const addStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddStockDto }) =>
      inventoryService.addStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('تم إضافة المخزون بنجاح');
    },
    onError: () => {
      toast.error('فشل إضافة المخزون');
    },
  });

  // Remove stock
  const removeStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RemoveStockDto }) =>
      inventoryService.removeStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('تم إزالة المخزون بنجاح');
    },
    onError: () => {
      toast.error('فشل إزالة المخزون');
    },
  });

  return {
    inventory: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
    createInventory: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateInventory: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    addStock: addStockMutation.mutate,
    isAddingStock: addStockMutation.isPending,
    removeStock: removeStockMutation.mutate,
    isRemovingStock: removeStockMutation.isPending,
  };
}

// Get single inventory record
export function useInventoryById(id: string) {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: () => inventoryService.getInventoryById(id),
    enabled: !!id,
  });
}

