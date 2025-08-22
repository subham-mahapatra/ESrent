import mongoose, { Schema, model, Model } from 'mongoose';

export interface IReview {
  carId: mongoose.Types.ObjectId | string;
  userId?: mongoose.Types.ObjectId | string; // Optional for admin-created reviews
  userName: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  isFeatured: boolean;
  isAdminCreated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  carId: {
    type: Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for admin-created reviews
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: false,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isAdminCreated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret: Record<string, unknown>) {
      ret.id = ret._id ? (ret._id as { toString: () => string }).toString() : undefined;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes for better performance
reviewSchema.index({ carId: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ isFeatured: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: -1 });

export const Review: Model<IReview> = mongoose.models.Review || model<IReview>('Review', reviewSchema);
