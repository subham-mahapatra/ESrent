'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Send } from 'lucide-react';
import { useCreateReview } from '@/hooks/useReactQuery';

interface ReviewFormProps {
  carId: string;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ carId, onReviewSubmitted }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    rating: 0,
    title: '',
    comment: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  
  // Use React Query mutation hook
  const createReviewMutation = useCreateReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userName || !formData.rating || !formData.title || !formData.comment) {
      return; // Validation is handled by the mutation hook
    }

    // Submit review using React Query mutation
    createReviewMutation.mutate({
      carId,
      rating: formData.rating,
      comment: formData.comment,
      title: formData.title,
      userName: formData.userName,
      userEmail: formData.userEmail,
    }, {
      onSuccess: () => {
        // Reset form on success
        setFormData({
          userName: '',
          userEmail: '',
          rating: 0,
          title: '',
          comment: ''
        });
        
        // Call the callback
        onReviewSubmitted?.();
      }
    });
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const isSubmitting = createReviewMutation.isPending;

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 backdrop-blur-sm">
      <h3 className="text-xl font-semibold text-white mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="userName" className="text-white">Name *</Label>
            <Input
              id="userName"
              value={formData.userName}
              onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
              className="bg-gray-700/50 border-gray-600 text-white"
              placeholder="Your name"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="userEmail" className="text-white">Email</Label>
            <Input
              id="userEmail"
              type="email"
              value={formData.userEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, userEmail: e.target.value }))}
              className="bg-gray-700/50 border-gray-600 text-white"
              placeholder="Your email (optional)"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <Label className="text-white">Rating *</Label>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || formData.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {formData.rating > 0 ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}` : 'Click to rate'}
          </p>
        </div>

        <div>
          <Label htmlFor="title" className="text-white">Review Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="bg-gray-700/50 border-gray-600 text-white"
            placeholder="Brief summary of your experience"
            maxLength={100}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="comment" className="text-white">Review Comment *</Label>
          <Textarea
            id="comment"
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            className="bg-gray-700/50 border-gray-600 text-white min-h-[100px]"
            placeholder="Share your detailed experience with this car..."
            maxLength={1000}
            required
            disabled={isSubmitting}
          />
          <p className="text-sm text-gray-400 mt-1">
            {formData.comment.length}/1000 characters
          </p>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !formData.rating}
          className="w-full bg-[#44CAAD] hover:bg-[#44CAAD]-100 text-white"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Submit Review
            </div>
          )}
        </Button>

        {/* Error display */}
        {createReviewMutation.isError && (
          <div className="text-red-400 text-sm text-center">
            {createReviewMutation.error?.message || 'Failed to submit review. Please try again.'}
          </div>
        )}
      </form>
    </div>
  );
}
