import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  specialization: string;
  education: string[];
  experience: string;
  certificates: string[];
  languages: string[];
  biography: string;
  consultationFee?: number;
  availability?: {
    days: string[];
    timeSlots: {
      start: string;
      end: string;
    }[];
  };
  workplaces?: {
    clinicName: string;
    address: string;
    position: string;
    startDate: string;
    endDate?: string;
  }[];
  avatarUrl?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new Schema({
  start: {
    type: String,
    required: true,
  },
  end: {
    type: String,
    required: true,
  },
});

const WorkplaceSchema = new Schema({
  clinicName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
  },
});

const DoctorProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    education: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      default: '',
    },
    certificates: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    biography: {
      type: String,
      default: '',
    },
    consultationFee: {
      type: Number,
    },
    availability: {
      days: {
        type: [String],
        default: [],
      },
      timeSlots: {
        type: [TimeSlotSchema],
        default: [],
      },
    },
    workplaces: {
      type: [WorkplaceSchema],
      default: [],
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const DoctorProfile = mongoose.model<IDoctorProfile>('DoctorProfile', DoctorProfileSchema); 