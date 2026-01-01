export interface Store {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  category?: string;
  rating: number;
  reviewsCount: number;
  productsCount: number;
  followersCount: number;
  salesCount: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoresResponse {
  stores: Store[];
  total: number;
  page: number;
  limit: number;
}

export interface StoreFilters {
  page?: number;
  limit?: number;
  category?: string;
  sort?: 'rating_desc' | 'rating_asc' | 'newest' | 'oldest';
  search?: string;
}

