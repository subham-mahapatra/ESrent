import { Schema, model, models, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: 'carType' | 'fuelType' | 'transmission' | 'tag';
  image?: string;
  description?: string;
  carCount?: number;
  featured?: boolean;
  
  // MongoDB specific fields
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['carType', 'fuelType', 'transmission', 'tag']
  },
  image: {
    type: String
  },
  description: {
    type: String,
    trim: true
  },
  carCount: {
    type: Number,
    default: 0,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete (ret as Record<string, unknown>)._id;
      delete (ret as Record<string, unknown>).__v;
      return ret;
    }
  }
});

// Create indexes for better performance
categorySchema.index({ type: 1 });
categorySchema.index({ featured: 1 });
categorySchema.index({ name: 'text' });

export const Category = models.Category || model<ICategory>('Category', categorySchema); 