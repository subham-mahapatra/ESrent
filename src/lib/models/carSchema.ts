import mongoose, { Schema, model, Model } from 'mongoose';

export interface ICar {
  brand: string;
  brandId?: string;
  model: string;
  name: string;
  year: number;
  mileage: number;
  originalPrice: number;
  discountedPrice?: number;
  images: string[];
  description?: string;
  keywords?: string[];
  features?: string[];
  available?: boolean;
  featured?: boolean;
  engine?: string;
  power?: string;
  seater?: number;
  carTypeIds?: string[];
  transmissionIds?: string[];
  fuelTypeIds?: string[];
  tagIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const carSchema = new Schema<ICar>({
  brand: {
    type: String,
    required: true,
    trim: true
  },
  brandId: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: false
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: false,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  mileage: {
    type: Number,
    min: 0
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    min: 0
  },
  images: [{
    type: String,
    required: true
  }],
  description: {
    type: String,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  available: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  engine: {
    type: String,
    trim: true
  },
  power: {
    type: String,
    trim: true
  },
  seater: {
    type: Number,
    min: 1
  },
  carTypeIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  }],
  transmissionIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  }],
  fuelTypeIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  }],
  tagIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  }]
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
carSchema.index({ brand: 1 });
carSchema.index({ category: 1 });
carSchema.index({ isFeatured: 1 });
carSchema.index({ isAvailable: 1 });
carSchema.index({ originalPrice: 1 });
carSchema.index({ discountedPrice: 1 });
carSchema.index({ name: 'text', brand: 'text', model: 'text' });

export const Car: Model<ICar> = mongoose.models.Car || model<ICar>('Car', carSchema); 