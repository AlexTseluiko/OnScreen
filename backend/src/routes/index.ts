import { Router } from 'express';
import userRoutes from './userRoutes';
import screeningRoutes from './screeningRoutes';
import facilityRoutes from './facilityRoutes';
import adminRoutes from './admin';
import authRoutes from './auth';
import notificationRoutes from './notificationRoutes';
import articleRoutes from './article';
import clinicRoutes from './clinic';
import feedbackRoutes from './feedback';

const router = Router();

// Подключаем имеющиеся маршруты
router.use('/users', userRoutes);
router.use('/screening', screeningRoutes);
router.use('/facilities', facilityRoutes);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/notifications', notificationRoutes);
router.use('/articles', articleRoutes);
router.use('/clinics', clinicRoutes);
router.use('/feedback', feedbackRoutes);

// Маршрут для проверки работы API
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is working' });
});

export default router;
