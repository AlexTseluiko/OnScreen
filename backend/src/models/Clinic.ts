import mongoose, { Document, Schema } from 'mongoose';

export interface IClinic extends Document {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  phone: string;
  email: string;
  website?: string;
  workingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  services: string[];
  doctors: mongoose.Types.ObjectId[];
  photos: string[];
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  owner: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const clinicSchema = new Schema<IClinic>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        },
      },
    },
    phone: {
      type: String,
      required: true,
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
    workingHours: {
      type: Map,
      of: {
        open: String,
        close: String,
      },
      default: {},
    },
    services: [
      {
        type: String,
        trim: true,
      },
    ],
    doctors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    photos: [
      {
        type: String,
      },
    ],
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для поиска
clinicSchema.index({ 'address.coordinates': '2dsphere' });
clinicSchema.index({ name: 'text', description: 'text' });

// Создаем и экспортируем модель с обоими вариантами (именованный и по умолчанию) для совместимости
const ClinicModel = mongoose.model<IClinic>('Clinic', clinicSchema);

// Именованный экспорт для использования с import { Clinic } from ...
export const Clinic = ClinicModel;

// Экспорт по умолчанию для использования с import Clinic from ...
export default ClinicModel;
