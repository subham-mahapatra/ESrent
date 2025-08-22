export interface Review {
  id?: string;
  _id?: string;
  carId: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  isFeatured: boolean;
  isAdminCreated: boolean;
  createdAt: string;
  updatedAt: string;
  car?: {
    id?: string;
    _id?: string;
    name: string;
    brand: string;
    model: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface CreateReviewData {
  carId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
}

export interface UpdateReviewData {
  userName?: string;
  userEmail?: string;
  rating?: number;
  title?: string;
  comment?: string;
}
