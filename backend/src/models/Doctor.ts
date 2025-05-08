import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
  user: mongoose.Types.ObjectId;
  clinic: mongoose.Types.ObjectId;
  specialization: string[];
  experience: number;
  education: string[];
  certifications: string[];
  rating: number;
  reviewsCount: number;
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
    };
  };
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clinic: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    specialization: [{
      type: String,
      required: true,
    }],
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    education: [{
      type: String,
      required: true,
    }],
    certifications: [{
      type: String,
    }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    workingHours: {
      type: Map,
      of: {
        start: String,
        end: String,
      },
      default: {},
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для поиска
doctorSchema.index({ clinic: 1, specialization: 1 });
doctorSchema.index({ rating: -1 });
doctorSchema.index({ isAvailable: 1 });

export const Doctor = mongoose.model<IDoctor>('Doctor', doctorSchema); 