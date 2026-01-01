import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { wishlistService } from '../services/wishlist.service';

const WISHLIST_QUERY_KEY = ['wishlist'];

/**
 * Get wishlist
 */
export function useWishlist() {
  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: () => wishlistService.getWishlist(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Add to wishlist
 */
export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      toast.success('تمت الإضافة للمفضلة');
    },
    onError: () => {
      toast.error('فشلت الإضافة للمفضلة');
    },
  });
}

/**
 * Remove from wishlist
 */
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      toast.success('تمت الإزالة من المفضلة');
    },
    onError: () => {
      toast.error('فشلت الإزالة من المفضلة');
    },
  });
}

/**
 * Toggle wishlist
 */
export function useToggleWishlist() {
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  return {
    toggle: (productId: string, isInWishlist: boolean) => {
      if (isInWishlist) {
        removeFromWishlist.mutate(productId);
      } else {
        addToWishlist.mutate(productId);
      }
    },
    isLoading: addToWishlist.isPending || removeFromWishlist.isPending,
  };
}

