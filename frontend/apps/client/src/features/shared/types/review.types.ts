export interface Review {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId?: string;
  storeId?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  averageRating: number;
}

export interface CreateReviewInput {
  productId?: string;
  storeId?: string;
  rating: number;
  comment: string;
  images?: File[];
}

