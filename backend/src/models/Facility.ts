import mongoose, { Document, Schema } from 'mongoose';

export interface IFacility extends Document {
  name: string;
  address: string;
  description: string;
  rating: number;
  reviews: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  services: string[];
  workingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  images: string[];
  type: 'hospital' | 'clinic' | 'pharmacy' | 'laboratory';
  phone: string;
  email: string;
  website?: string;
  isVerified: boolean;
}

const facilitySchema = new Schema<IFacility>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    services: [{
      type: String,
      trim: true,
    }],
    workingHours: {
      type: Map,
      of: {
        open: String,
        close: String,
      },
      default: {},
    },
    images: [{
      type: String,
    }],
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'pharmacy', 'laboratory'],
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для поиска
facilitySchema.index({ name: 'text', address: 'text', description: 'text' });
facilitySchema.index({ coordinates: '2dsphere' });

export const Facility = mongoose.model<IFacility>('Facility', facilitySchema); 