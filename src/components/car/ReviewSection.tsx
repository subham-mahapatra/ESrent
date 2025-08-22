'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReviewDisplay } from './ReviewDisplay';
import { ReviewForm } from './ReviewForm';
import { MessageSquare, Star } from 'lucide-react';

interface ReviewSectionProps {
  carId: string;
}

export function ReviewSection({ carId }: ReviewSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#44CAAD] rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Reviews</h2>
            <p className="text-gray-400">See what customers say about this car</p>
          </div>
        </div>
        
        <Button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-[#44CAAD] hover:bg-[#44CAAD]-100 text-white"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {showReviewForm ? 'Hide Review Form' : 'Write a Review'}
        </Button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm 
          carId={carId} 
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Review Display */}
      <ReviewDisplay 
        carId={carId} 
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
