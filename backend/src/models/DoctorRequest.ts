import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorRequest extends Document {
  user: mongoose.Types.ObjectId;
  specialization: string;
  experience: string;
  education: string;
  licenseNumber: string;
  about: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  processedAt?: Date;
}

const doctorRequestSchema = new Schema<IDoctorRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    education: {
      type: String,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    about: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Создаем индексы для оптимизации запросов
doctorRequestSchema.index({ user: 1 });
doctorRequestSchema.index({ status: 1 });
doctorRequestSchema.index({ createdAt: -1 });

export const DoctorRequest = mongoose.model<IDoctorRequest>('DoctorRequest', doctorRequestSchema); 