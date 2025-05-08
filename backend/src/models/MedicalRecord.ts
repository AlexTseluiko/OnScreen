import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicalRecord extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  clinic: mongoose.Types.ObjectId;
  date: Date;
  diagnosis: string;
  treatment: string;
  medications: string[];
  notes: string;
  attachments: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const medicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clinic: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    treatment: {
      type: String,
      required: true,
    },
    medications: [{
      type: String,
    }],
    notes: {
      type: String,
    },
    attachments: [{
      type: String,
    }],
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для поиска
medicalRecordSchema.index({ patient: 1, date: -1 });
medicalRecordSchema.index({ doctor: 1, date: -1 });
medicalRecordSchema.index({ clinic: 1, date: -1 });
medicalRecordSchema.index({ isPrivate: 1 });

// Создаем и экспортируем модель с обоими вариантами (именованный и по умолчанию) для совместимости
const MedicalRecordModel = mongoose.model<IMedicalRecord>('MedicalRecord', medicalRecordSchema);

// Именованный экспорт для использования с import { MedicalRecord } from ...
export const MedicalRecord = MedicalRecordModel;

// Экспорт по умолчанию для использования с import MedicalRecord from ...
export default MedicalRecordModel; 