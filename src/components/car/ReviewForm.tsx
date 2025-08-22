'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Send } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userName || !formData.rating || !formData.title || !formData.comment) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId,
          ...formData
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Review submitted successfully!",
        });
        
        // Reset form
        setFormData({
          userName: '',
          userEmail: '',
          rating: 0,
          title: '',
          comment: ''
        });
        
        onReviewSubmitted?.();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit review",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

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
                className="transition-colors"
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
      </form>
    </div>
  );
}
