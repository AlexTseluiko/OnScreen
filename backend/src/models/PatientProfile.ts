import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientProfile extends Document {
  userId: mongoose.Types.ObjectId;
  birthDate: string;
  gender: string;
  height: number;
  weight: number;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  medicalHistory: string;
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
  preferredLanguage: string;
  lastCheckup: Date;
  familyDoctor: mongoose.Types.ObjectId;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema({
  name: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  relationship: {
    type: String,
    default: '',
  },
});

const InsuranceSchema = new Schema({
  provider: {
    type: String,
    default: '',
  },
  policyNumber: {
    type: String,
    default: '',
  },
  expiryDate: {
    type: String,
    default: '',
  },
});

const PatientProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    birthDate: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    height: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      default: 0,
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    allergies: {
      type: [String],
      default: [],
    },
    chronicConditions: {
      type: [String],
      default: [],
    },
    medications: {
      type: [String],
      default: [],
    },
    medicalHistory: {
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
    preferredLanguage: {
      type: String,
      default: 'ru',
    },
    lastCheckup: {
      type: Date,
      default: null,
    },
    familyDoctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

export const PatientProfile = mongoose.model<IPatientProfile>(
  'PatientProfile',
  PatientProfileSchema
);
