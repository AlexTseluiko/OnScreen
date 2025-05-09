import express from 'express';
import authRoutes from './auth';
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
import { auth, checkRole } from '../middleware/auth';
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
router.use('/facilities', facilityRoutes);
router.use('/feedback', feedbackRoutes);

// Защищенные маршруты
router.use('/profile', auth, profileRoutes);
router.use('/messages', auth, messageRoutes);
router.use('/articles', auth, articleRoutes);
router.use('/reviews', auth, reviewRoutes);
router.use('/notifications', auth, notificationRoutes);
router.use('/admin', auth, checkRole([UserRole.ADMIN]), adminRoutes);
router.use('/appointments', auth, appointmentRoutes);
router.use('/doctors', auth, doctorRoutes);
router.use('/clinics', auth, clinicRoutes);
router.use('/medical-records', auth, medicalRecordRoutes);
router.use('/doctor-profiles', auth, doctorProfileRoutes);
router.use('/patient-profiles', auth, patientProfileRoutes);
router.use('/users', auth, userRoutes);

export default router;
