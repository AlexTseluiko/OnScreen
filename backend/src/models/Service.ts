import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  clinic: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  isAvailable: boolean;
  doctors: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    clinic: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    doctors: [{
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
    }],
  },
  {
    timestamps: true,
  }
);

// Индексы для поиска
serviceSchema.index({ clinic: 1, category: 1 });
serviceSchema.index({ name: 'text', description: 'text' });
serviceSchema.index({ isAvailable: 1 });
serviceSchema.index({ price: 1 });

export const Service = mongoose.model<IService>('Service', serviceSchema); 