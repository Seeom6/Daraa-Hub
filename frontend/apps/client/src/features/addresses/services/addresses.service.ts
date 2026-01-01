import { apiClient } from '@/lib/api-client';
import type { Address, AddressInput, AddressesResponse } from '@/features/shared/types/address.types';

const ADDRESSES_BASE_URL = '/addresses';

export const addressesService = {
  /**
   * Get all addresses
   */
  getAddresses: async (): Promise<Address[]> => {
    const response = await apiClient.get<AddressesResponse>(ADDRESSES_BASE_URL);
    return response.data.addresses;
  },

  /**
   * Get address by ID
   */
  getAddressById: async (id: string): Promise<Address> => {
    const response = await apiClient.get<{ address: Address }>(`${ADDRESSES_BASE_URL}/${id}`);
    return response.data.address;
  },

  /**
   * Create new address
   */
  createAddress: async (input: AddressInput): Promise<Address> => {
    const response = await apiClient.post<{ address: Address }>(ADDRESSES_BASE_URL, input);
    return response.data.address;
  },

  /**
   * Update address
   */
  updateAddress: async (id: string, input: AddressInput): Promise<Address> => {
    const response = await apiClient.put<{ address: Address }>(
      `${ADDRESSES_BASE_URL}/${id}`,
      input
    );
    return response.data.address;
  },

  /**
   * Delete address
   */
  deleteAddress: async (id: string): Promise<void> => {
    await apiClient.delete(`${ADDRESSES_BASE_URL}/${id}`);
  },

  /**
   * Set default address
   */
  setDefaultAddress: async (id: string): Promise<Address> => {
    const response = await apiClient.put<{ address: Address }>(
      `${ADDRESSES_BASE_URL}/${id}/set-default`
    );
    return response.data.address;
  },
};

