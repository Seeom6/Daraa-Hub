import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressesService } from '../services/addresses.service';
import type { AddressInput } from '@/features/shared/types/address.types';
import { toast } from 'react-hot-toast';

const ADDRESSES_QUERY_KEY = ['addresses'];

/**
 * Hook to get all addresses
 */
export function useAddresses() {
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: () => addressesService.getAddresses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get address by ID
 */
export function useAddress(id: string) {
  return useQuery({
    queryKey: [...ADDRESSES_QUERY_KEY, id],
    queryFn: () => addressesService.getAddressById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create address
 */
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddressInput) => addressesService.createAddress(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
      toast.success('تم إضافة العنوان بنجاح');
    },
    onError: () => {
      toast.error('فشل إضافة العنوان');
    },
  });
}

/**
 * Hook to update address
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AddressInput }) =>
      addressesService.updateAddress(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
      toast.success('تم تحديث العنوان بنجاح');
    },
    onError: () => {
      toast.error('فشل تحديث العنوان');
    },
  });
}

/**
 * Hook to delete address
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressesService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
      toast.success('تم حذف العنوان بنجاح');
    },
    onError: () => {
      toast.error('فشل حذف العنوان');
    },
  });
}

/**
 * Hook to set default address
 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressesService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
      toast.success('تم تعيين العنوان الافتراضي');
    },
    onError: () => {
      toast.error('فشل تعيين العنوان الافتراضي');
    },
  });
}

