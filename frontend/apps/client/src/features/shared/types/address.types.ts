export interface Address {
  _id: string;
  accountId: string;
  fullName: string;
  phone: string;
  governorate: string;
  area: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  nearestLandmark?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressInput {
  fullName: string;
  phone: string;
  governorate: string;
  area: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  nearestLandmark?: string;
  isDefault?: boolean;
}

export interface AddressesResponse {
  addresses: Address[];
  total: number;
}

