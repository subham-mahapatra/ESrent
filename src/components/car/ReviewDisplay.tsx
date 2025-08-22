'use client';

import { useState, useEffect } from 'react';
import { Star, Award, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  isFeatured: boolean;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

interface ReviewDisplayProps {
  carId: string;
  refreshTrigger?: number;
}

export function ReviewDisplay({ carId, refreshTrigger }: ReviewDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const fetchReviews = async () => {
    try {
      const [reviewsResponse, statsResponse] = await Promise.all([
        fetch(`/api/reviews?carId=${carId}`),
        fetch(`/api/reviews/stats/${carId}`)
      ]);

      const reviewsData = await reviewsResponse.json();
      const statsData = await statsResponse.json();

      if (reviewsData.success) {
        setReviews(reviewsData.data);
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [carId]);

  useEffect(() => {
    if (refreshTrigger) {
      fetchReviews();
    }
  }, [refreshTrigger]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-4">{rating}</span>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton key="title-skeleton" className="h-8 w-48" />
          <Skeleton key="subtitle-skeleton" className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton key="skeleton-1" className="h-32 w-full" />
          <Skeleton key="skeleton-2" className="h-32 w-full" />
          <Skeleton key="skeleton-3" className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const hasMoreReviews = reviews.length > 3;

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      {stats && stats.totalReviews > 0 && (
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
                <p className="text-muted-foreground text-sm">
                  {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="md:col-span-2">
                <h4 className="font-medium mb-3 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Rating Distribution
                </h4>
                {renderRatingDistribution()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Customer Reviews ({reviews.length})
          </h3>
          
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <Card
                key={review.id}
                className={`border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm ${
                  review.isFeatured ? 'ring-2 ring-yellow-400/50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {review.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{review.userName}</h4>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-muted-foreground text-sm">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.isFeatured && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        <Award className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <h5 className="font-medium mb-2">{review.title}</h5>
                  <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMoreReviews && (
            <div className="text-center">
              <Button
                onClick={() => setShowAllReviews(!showAllReviews)}
                variant="outline"
                className="border-border/50 hover:bg-accent/50 transition-all duration-200"
              >
                {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              No Reviews Yet
            </h3>
            <p className="text-muted-foreground">Be the first to review this car!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
