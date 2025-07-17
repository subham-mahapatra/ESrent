import { Schema, model, models, Document } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  logo: string;
  slug: string;
  featured?: boolean;
  carCount?: number;
  
  // MongoDB specific fields
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  logo: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  carCount: {
    type: Number,
    default: 0,
    min: 0
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
brandSchema.index({ featured: 1 });
brandSchema.index({ name: 'text' });

export const Brand = models.Brand || model<IBrand>('Brand', brandSchema); 