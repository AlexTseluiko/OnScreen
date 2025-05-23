import { Schema, model, Document, Types } from 'mongoose';

export interface ScreeningAppointmentDocument extends Document {
  programId: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScreeningAppointmentSchema = new Schema<ScreeningAppointmentDocument>(
  {
    programId: { type: Schema.Types.ObjectId, ref: 'ScreeningProgram', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
      required: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Индекс для быстрого поиска записей пользователя
ScreeningAppointmentSchema.index({ userId: 1, date: -1 });

// Индекс для быстрого поиска по программе скрининга
ScreeningAppointmentSchema.index({ programId: 1 });

export default model<ScreeningAppointmentDocument>(
  'ScreeningAppointment',
  ScreeningAppointmentSchema
);
