import mongoose, { Schema } from 'mongoose';

export interface ICar {
  brand: string;
  brandId?: string;
  model: string;
  name: string;
  year: number;
  transmission: string;
  fuel: string;
  mileage: number;
  dailyPrice: number;
  images: string[];
  description?: string;
  features?: string[];
  category?: string;
  categoryId?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  engine?: string;
  power?: string;
  tags?: string[];
  seater?: number;
  // Legacy fields for backward compatibility
  fuelType?: string;
  type?: string;
  available?: boolean;
  featured?: boolean;
  // MongoDB specific fields
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
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  transmission: {
    type: String,
    required: true,
    enum: ['Automatic', 'Manual', 'CVT', 'Semi-Automatic']
  },
  fuel: {
    type: String,
    required: true,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid']
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  dailyPrice: {
    type: Number,
    required: true,
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
  features: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
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
  tags: [{
    type: String,
    trim: true
  }],
  seater: {
    type: Number,
    min: 1
  },
  
  // Legacy fields
  fuelType: String,
  type: String,
  available: Boolean,
  featured: Boolean
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret: any) {
      ret.id = ret._id ? ret._id.toString() : undefined;
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
carSchema.index({ dailyPrice: 1 });
carSchema.index({ name: 'text', brand: 'text', model: 'text' });

let Car;
try {
  // Check if mongoose.models exists and Car is defined
  if (mongoose.models && mongoose.models.Car) {
    Car = mongoose.models.Car;
  } else {
    Car = mongoose.model<ICar>('Car', carSchema);
  }
} catch (err) {
  // Fallback: define the model if not already defined
  Car = mongoose.model<ICar>('Car', carSchema);
}

export { Car }; 