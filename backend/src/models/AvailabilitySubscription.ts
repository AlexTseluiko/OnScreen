import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED'
}

export interface IAvailabilitySubscription extends Document {
  user: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  preferredDates: Date[];
  preferredTimes: string[];
  status: SubscriptionStatus;
  lastNotified: Date;
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySubscriptionSchema = new Schema<IAvailabilitySubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    preferredDates: [{
      type: Date,
      required: true,
    }],
    preferredTimes: [{
      type: String,
      required: true,
    }],
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
    },
    lastNotified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для поиска
availabilitySubscriptionSchema.index({ user: 1, doctor: 1 });
availabilitySubscriptionSchema.index({ status: 1, lastNotified: 1 });

export const AvailabilitySubscription = mongoose.model<IAvailabilitySubscription>(
  'AvailabilitySubscription',
  availabilitySubscriptionSchema
); 