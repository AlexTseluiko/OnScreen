import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

async function deleteAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@onscreen.com';

    // Удаляем администратора
    const result = await User.deleteOne({ email: adminEmail });

    if (result.deletedCount > 0) {
      console.log('Администратор успешно удален');
    } else {
      console.log('Администратор не найден');
    }
  } catch (error) {
    console.error('Ошибка при удалении администратора:', error);
  } finally {
    await mongoose.disconnect();
  }
}

deleteAdmin();
