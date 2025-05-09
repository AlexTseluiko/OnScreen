import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, UserRole } from '../models/User';

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@onscreen.com';
    const adminPassword = 'admin123'; // Это временный пароль, его нужно будет изменить после первого входа

    // Проверяем, существует ли уже администратор
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Администратор уже существует');
      process.exit(0);
    }

    // Создаем нового администратора
    const admin = new User({
      firstName: 'Администратор',
      lastName: 'Системы',
      email: adminEmail,
      password: adminPassword, // Пароль будет автоматически захеширован в pre-save хуке
      role: UserRole.ADMIN,
      isVerified: true,
      verificationToken: undefined,
    });

    await admin.save();
    console.log('Администратор успешно создан');
    console.log('Email:', adminEmail);
    console.log('Пароль:', adminPassword);
    console.log('Пожалуйста, измените пароль после первого входа!');
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
