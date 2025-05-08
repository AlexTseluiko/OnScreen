import express from 'express';
import authRoutes from './auth';
// Закомментируем или удалим несуществующие импорты
// import userRoutes from './user';
import clinicRoutes from './clinic';
import doctorRoutes from './doctor';
import appointmentRoutes from './appointment';
import reviewRoutes from './review';
import profileRoutes from './profile';
import feedbackRoutes from './feedback';
import notificationRoutes from './notification';
import adminRoutes from './admin';
import medicalRecordRoutes from './medicalRecord';
import facilityRoutes from './facilityRoutes';
import { authenticate, auth, checkRole } from '../middleware/auth';
import { UserRole } from '../types/user';
import messageRoutes from './message';
import articleRoutes from './article';
import doctorProfileRoutes from './doctorProfile';
import patientProfileRoutes from './patientProfile';
import userRoutes from './userRoutes';

const router = express.Router();

// Эндпоинт проверки здоровья сервера
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API работает' });
});

// Публичные маршруты
router.use('/auth', authRoutes);
// router.use('/users', userRoutes); // Закомментируем, так как модуль не существует
router.use('/clinics', clinicRoutes);
router.use('/facilities', facilityRoutes);
router.use('/feedback', feedbackRoutes);

// Изменим маршрут для профиля на /profile
router.use('/profile', authenticate, profileRoutes);

// Защищенные маршруты
router.use('/reviews', authenticate, reviewRoutes);
router.use('/notifications', authenticate, notificationRoutes);
router.use('/admin', auth, checkRole([UserRole.ADMIN]), adminRoutes);
router.use('/appointments', authenticate, appointmentRoutes);
router.use('/doctors', authenticate, doctorRoutes);
router.use('/medical-records', authenticate, medicalRecordRoutes);

// Маршруты сообщений
router.use('/messages', authenticate, messageRoutes);

// Маршруты статей
router.use('/articles', articleRoutes);

// Маршруты профилей докторов
router.use('/doctor-profiles', doctorProfileRoutes);

// Маршруты профилей пациента
router.use('/patient-profiles', patientProfileRoutes);

// Маршруты для пользователей
router.use('/users', userRoutes);

export default router; 