/**
 * React Query Hooks for Users
 * Provides data fetching, caching, and mutations for user management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as usersApi from '../api/users.api';
import type {
  GetUsersParams,
  SearchUsersParams,
  SuspendUserRequest,
  UnsuspendUserRequest,
  BanUserRequest,
} from '../types/user.types';

// ============================================================================
// Query Keys
// ============================================================================

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: GetUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  search: (query: string) => [...userKeys.all, 'search', query] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch users list with filters and pagination
 */
export const useUsers = (params: GetUsersParams = {}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.getUsers(params),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
};

/**
 * Hook to search users
 */
export const useSearchUsers = (params: SearchUsersParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: userKeys.search(params.q),
    queryFn: () => usersApi.searchUsers(params),
    enabled: enabled && params.q.length >= 2, // Only search if query is at least 2 chars
    staleTime: 10000, // 10 seconds
  });
};

/**
 * Hook to fetch user details
 */
export const useUser = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getUserById(id),
    enabled: enabled && !!id,
    staleTime: 60000, // 1 minute
  });
};

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to suspend user
 */
export const useSuspendUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SuspendUserRequest }) =>
      usersApi.suspendUser(id, payload),
    onSuccess: (data, variables) => {
      toast.success('تم تعليق المستخدم بنجاح');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل تعليق المستخدم');
    },
  });
};

/**
 * Hook to unsuspend user
 */
export const useUnsuspendUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UnsuspendUserRequest }) =>
      usersApi.unsuspendUser(id, payload),
    onSuccess: (data, variables) => {
      toast.success('تم إلغاء تعليق المستخدم بنجاح');
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل إلغاء التعليق');
    },
  });
};

/**
 * Hook to ban user
 */
export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BanUserRequest }) =>
      usersApi.banUser(id, payload),
    onSuccess: (data, variables) => {
      toast.success('تم حظر المستخدم بنجاح');
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل حظر المستخدم');
    },
  });
};

/**
 * Hook to bulk suspend users
 */
export const useBulkSuspendUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, payload }: { userIds: string[]; payload: SuspendUserRequest }) =>
      usersApi.bulkSuspendUsers(userIds, payload),
    onSuccess: (data, variables) => {
      toast.success(`تم تعليق ${variables.userIds.length} مستخدم بنجاح`);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل التعليق الجماعي');
    },
  });
};

/**
 * Hook to export users
 */
export const useExportUsers = () => {
  return useMutation({
    mutationFn: (params: GetUsersParams) => usersApi.exportUsers(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-${new Date().toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('تم تصدير البيانات بنجاح');
    },
    onError: () => {
      toast.error('فشل تصدير البيانات');
    },
  });
};

