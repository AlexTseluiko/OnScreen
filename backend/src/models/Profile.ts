import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  medicalHistory: string;
  allergies: string;
  bloodType: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  medications: string[];
  chronicConditions: string[];
  lastCheckup: Date;
  preferredLanguage: string;
  height: string;
  weight: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema({
  name: String,
  phone: String,
  relationship: String,
});

const InsuranceSchema = new Schema({
  provider: String,
  policyNumber: String,
  expiryDate: String,
});

const ProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    birthDate: {
      type: String,
      default: '',
    },
    medicalHistory: {
      type: String,
      default: '',
    },
    allergies: {
      type: String,
      default: '',
    },
    bloodType: {
      type: String,
      default: '',
    },
    emergencyContact: {
      type: EmergencyContactSchema,
      default: () => ({}),
    },
    insurance: {
      type: InsuranceSchema,
      default: () => ({}),
    },
    medications: {
      type: [String],
      default: [],
    },
    chronicConditions: {
      type: [String],
      default: [],
    },
    lastCheckup: {
      type: Date,
      default: null,
    },
    preferredLanguage: {
      type: String,
      default: '',
    },
    height: {
      type: String,
      default: '',
    },
    weight: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Profile = mongoose.model<IProfile>('Profile', ProfileSchema);
