import mongoose, { Document, Schema } from 'mongoose';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  clinic: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  status: AppointmentStatus;
  type: string;
  notes?: string;
  symptoms?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
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
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
    },
    type: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    symptoms: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Индексы для поиска
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ clinic: 1, date: 1 });
appointmentSchema.index({ status: 1, date: 1 });

// Создаем и экспортируем модель с обоими вариантами (именованный и по умолчанию) для совместимости
const AppointmentModel = mongoose.model<IAppointment>('Appointment', appointmentSchema);

// Именованный экспорт для использования с import { Appointment } from ...
export const Appointment = AppointmentModel;

// Экспорт по умолчанию для использования с import Appointment from ...
export default AppointmentModel;
