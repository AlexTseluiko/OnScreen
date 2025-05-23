import mongoose from 'mongoose';
import { handleError } from '../utils/errorHandler';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onscreen';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Обработка ошибок подключения
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    // Обработка отключения
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Обработка завершения работы приложения
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
